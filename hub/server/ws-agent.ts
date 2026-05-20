import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage, Server } from "node:http";
import { upsertAgent, updateAgentHeartbeat, deleteAgent, type Agent } from "./db/index.js";
import { broadcastRaw } from "./ws-ui.js";
import { randomUUID } from "node:crypto";

const AGENT_WS_PATH = "/agents";

interface RegisterMessage {
  type: "register";
  workspace: string;
  pid: number;
  host: string;
}

interface HeartbeatMessage {
  type: "heartbeat";
}

interface ActivityMessage {
  type: "activity";
  event: string;
  detail: unknown;
}

type AgentMessage = RegisterMessage | HeartbeatMessage | ActivityMessage;

interface AgentSession {
  agentId: string;
  workspaceId: string;
}

function parseMessage(raw: string): AgentMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "type" in parsed &&
      typeof (parsed as Record<string, unknown>)["type"] === "string"
    ) {
      return parsed as AgentMessage;
    }
    return null;
  } catch {
    return null;
  }
}

export function attachAgentWebSocketServer(httpServer: Server): void {
  const wss = new WebSocketServer({ server: httpServer, path: AGENT_WS_PATH });

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    let session: AgentSession | null = null;

    ws.on("message", (data) => {
      const message = parseMessage(data.toString());
      if (!message) {
        return;
      }

      if (message.type === "register") {
        const agentId = randomUUID();
        const workspaceId = message.workspace;
        session = { agentId, workspaceId };

        const agentRecord: Omit<Agent, "created_at" | "last_heartbeat"> = {
          id: agentId,
          workspace_id: workspaceId,
          pid: message.pid,
          host: message.host,
          status: "idle",
        };
        upsertAgent(agentRecord);

        broadcastRaw({ type: "agent-registered", agentId, workspaceId });
        return;
      }

      if (!session) {
        return;
      }

      if (message.type === "heartbeat") {
        updateAgentHeartbeat(session.agentId);
        return;
      }

      if (message.type === "activity") {
        broadcastRaw({
          type: "activity",
          agentId: session.agentId,
          event: message.event,
          detail: message.detail,
        });
      }
    });

    ws.on("close", () => {
      if (session) {
        deleteAgent(session.agentId);
      }
    });

    ws.on("error", () => {
      if (session) {
        deleteAgent(session.agentId);
      }
    });
  });
}

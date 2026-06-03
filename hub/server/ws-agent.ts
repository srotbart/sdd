import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage, Server } from "node:http";
import { upsertAgent, updateAgentHeartbeat, updateAgentStatus, deleteAgent, type Agent } from "./db/index.js";
import { broadcastAgentRegistered, broadcastActivity } from "./ws-ui.js";
import { randomUUID } from "node:crypto";

const AGENT_WS_PATH = "/agents";

interface RegisterMessage {
  type: "register";
  workspace: string;
  pid: number;
  host: string;
  name?: string;
}

interface HeartbeatMessage {
  type: "heartbeat";
}

interface ActivityMessage {
  type: "activity";
  kind: "in" | "note" | "err";
  msg: string;
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

        const resolvedName = message.name ?? `${message.pid}@${message.host}`;
        const agentRecord: Omit<Agent, "created_at" | "last_heartbeat" | "initials"> = {
          id: agentId,
          workspace_id: workspaceId,
          pid: message.pid,
          host: message.host,
          status: "idle",
          name: resolvedName,
        };
        upsertAgent(agentRecord);

        broadcastAgentRegistered(agentId, workspaceId);
        return;
      }

      if (!session) {
        return;
      }

      if (message.type === "heartbeat") {
        updateAgentHeartbeat(session.agentId);
        updateAgentStatus(session.agentId, "idle");
        return;
      }

      if (message.type === "activity") {
        updateAgentStatus(session.agentId, "busy");
        broadcastActivity(session.agentId, session.workspaceId, message.kind, message.msg);
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

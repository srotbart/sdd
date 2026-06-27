import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage, Server } from "node:http";
import { getAllAgents, type Agent } from "./db/index.js";
import { getWorkspacesEnriched, type WorkspaceData } from "./workspace-data.js";

export type SddArtifact = "targets" | "specs" | "gaps" | "work-items" | "projections" | "designs" | "issues" | "improvements" | "standards";

export interface StateSnapshot {
  type: "snapshot";
  workspaces: WorkspaceData[];
  agents: Agent[];
}

export interface UpdateMessage {
  type: "update";
  changedPath: string;
  workspaces: WorkspaceData[];
  agents: Agent[];
}

export interface SddChangedMessage {
  type: "sdd-changed";
  workspaceId: string;
  artifact: SddArtifact;
}

export interface AgentRegisteredMessage {
  type: "agent-registered";
  agentId: string;
  workspaceId: string;
}

export interface ActivityMessage {
  type: "activity";
  agentId: string;
  workspaceId: string;
  kind: "in" | "note" | "err";
  msg: string;
  t: string;
}

export type UiMessage = StateSnapshot | UpdateMessage | SddChangedMessage | AgentRegisteredMessage | ActivityMessage;

const connectedClients = new Set<WebSocket>();

function buildSnapshot(): StateSnapshot {
  return {
    type: "snapshot",
    workspaces: getWorkspacesEnriched(),
    agents: getAllAgents(),
  };
}

function sendJson(client: WebSocket, payload: UiMessage): void {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(payload));
  }
}

export function broadcastUpdate(changedPath: string): void {
  const message: UpdateMessage = {
    type: "update",
    changedPath,
    workspaces: getWorkspacesEnriched(),
    agents: getAllAgents(),
  };
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      sendJson(client, message);
    } else {
      connectedClients.delete(client);
    }
  }
}

export function broadcastAgentRegistered(agentId: string, workspaceId: string): void {
  const message: AgentRegisteredMessage = { type: "agent-registered", agentId, workspaceId };
  const serialized = JSON.stringify(message);
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    } else {
      connectedClients.delete(client);
    }
  }
}

export function broadcastActivity(agentId: string, workspaceId: string, kind: "in" | "note" | "err", msg: string): void {
  const message: ActivityMessage = {
    type: "activity",
    agentId,
    workspaceId,
    kind,
    msg,
    t: new Date().toISOString(),
  };
  const serialized = JSON.stringify(message);
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    } else {
      connectedClients.delete(client);
    }
  }
}

export function broadcastSddChanged(workspaceId: string, artifact: SddArtifact): void {
  const message: SddChangedMessage = { type: "sdd-changed", workspaceId, artifact };
  const serialized = JSON.stringify(message);
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    } else {
      connectedClients.delete(client);
    }
  }
}

export function attachUiWebSocketServer(httpServer: Server): void {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    connectedClients.add(ws);
    sendJson(ws, buildSnapshot());

    ws.on("close", () => {
      connectedClients.delete(ws);
    });

    ws.on("error", () => {
      connectedClients.delete(ws);
    });
  });
}

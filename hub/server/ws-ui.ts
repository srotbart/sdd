import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage, Server } from "node:http";
import { getAllWorkspaces, getAllAgents, type Workspace, type Agent } from "./db/index.js";

export type SddArtifact = "targets" | "specs" | "gaps" | "work-items";

export interface StateSnapshot {
  type: "snapshot";
  workspaces: Workspace[];
  agents: Agent[];
}

export interface UpdateMessage {
  type: "update";
  changedPath: string;
  workspaces: Workspace[];
  agents: Agent[];
}

export interface SddChangedMessage {
  type: "sdd-changed";
  workspaceId: string;
  artifact: SddArtifact;
}

export type UiMessage = StateSnapshot | UpdateMessage | SddChangedMessage;

const connectedClients = new Set<WebSocket>();

function buildSnapshot(): StateSnapshot {
  return {
    type: "snapshot",
    workspaces: getAllWorkspaces(),
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
    workspaces: getAllWorkspaces(),
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

export function broadcastRaw(payload: Record<string, unknown>): void {
  const serialized = JSON.stringify(payload);
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

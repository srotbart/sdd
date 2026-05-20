import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import http from "node:http";
import { WebSocket } from "ws";

vi.mock("./db/index.js", () => ({
  getAllWorkspaces: () => [],
  getAllAgents: () => [],
}));

const { attachUiWebSocketServer, broadcastSddChanged } = await import("./ws-ui.js");

function startTestServer(): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve) => {
    const server = http.createServer();
    attachUiWebSocketServer(server);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve({ server, port: addr.port });
    });
  });
}

function connectClient(port: number): Promise<{ ws: WebSocket; firstMessage: Promise<unknown> }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    let firstMessageResolve: (value: unknown) => void;
    const firstMessage = new Promise<unknown>((res) => { firstMessageResolve = res; });
    ws.on("message", (data) => firstMessageResolve(JSON.parse(data.toString())));
    ws.on("open", () => resolve({ ws, firstMessage }));
    ws.on("error", reject);
  });
}

function waitForMessage(ws: WebSocket): Promise<unknown> {
  return new Promise((resolve) => {
    ws.once("message", (data) => resolve(JSON.parse(data.toString())));
  });
}


describe("broadcastSddChanged", () => {
  let server: http.Server;
  let port: number;

  beforeEach(async () => {
    ({ server, port } = await startTestServer());
  });

  afterEach(() => {
    server.close();
  });

  it("sends sdd-changed message with correct shape to a connected UI client", async () => {
    const { ws, firstMessage } = await connectClient(port);
    await firstMessage;

    const messagePromise = waitForMessage(ws);
    broadcastSddChanged("ws-123", "targets");
    const msg = await messagePromise;

    expect(msg).toEqual({ type: "sdd-changed", workspaceId: "ws-123", artifact: "targets" });
    ws.close();
  });

  it("sends to all connected clients simultaneously", async () => {
    const { ws: wsA, firstMessage: firstA } = await connectClient(port);
    const { ws: wsB, firstMessage: firstB } = await connectClient(port);
    await Promise.all([firstA, firstB]);

    const promiseA = waitForMessage(wsA);
    const promiseB = waitForMessage(wsB);
    broadcastSddChanged("ws-456", "gaps");

    const [msgA, msgB] = await Promise.all([promiseA, promiseB]);
    expect(msgA).toEqual({ type: "sdd-changed", workspaceId: "ws-456", artifact: "gaps" });
    expect(msgB).toEqual({ type: "sdd-changed", workspaceId: "ws-456", artifact: "gaps" });
    wsA.close();
    wsB.close();
  });

  it("sends correct artifact value for each artifact type", async () => {
    const artifacts = ["targets", "specs", "gaps", "work-items"] as const;
    for (const artifact of artifacts) {
      const { ws, firstMessage } = await connectClient(port);
      await firstMessage;
      const promise = waitForMessage(ws);
      broadcastSddChanged("ws-789", artifact);
      const msg = await promise as { type: string; artifact: string };
      expect(msg.artifact).toBe(artifact);
      ws.close();
    }
  });
});

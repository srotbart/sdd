import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import http from "node:http";
import { WebSocket } from "ws";

vi.mock("./db/index.js", () => ({
  getAllWorkspaces: () => [],
  getAllAgents: () => [],
}));

describe("broadcastSddChanged debug", () => {
  it("server starts and accepts connection", async () => {
    const { attachUiWebSocketServer, broadcastSddChanged } = await import("./ws-ui.js");

    const server = http.createServer();
    attachUiWebSocketServer(server);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const { port } = server.address() as { port: number };

    const connected = await new Promise<boolean>((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`);
      ws.on("open", () => resolve(true));
      ws.on("error", (err) => reject(err));
      setTimeout(() => reject(new Error("timeout")), 3000);
    });

    expect(connected).toBe(true);
    server.close();
  });
});

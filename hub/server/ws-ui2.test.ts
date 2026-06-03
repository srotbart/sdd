import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import http from "node:http";
import { WebSocket } from "ws";

vi.mock("./db/index.js", () => ({
  getAllWorkspaces: () => [],
  getAllAgents: () => [],
}));

// ws-ui.ts builds its snapshot via getWorkspacesEnriched(); mock it so the
// connection handler doesn't reach into the partial db mock (which would throw
// on the missing getAgentIdsByWorkspace export).
vi.mock("./workspace-data.js", () => ({
  getWorkspacesEnriched: () => [],
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

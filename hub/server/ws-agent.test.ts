import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import http from "node:http";
import { WebSocket } from "ws";

const agentDb = {
  upsertAgent: vi.fn(),
  updateAgentHeartbeat: vi.fn(),
  updateAgentStatus: vi.fn(),
  deleteAgent: vi.fn(),
};

vi.mock("./db/index.js", () => agentDb);
vi.mock("./ws-ui.js", () => ({ broadcastAgentRegistered: vi.fn(), broadcastActivity: vi.fn() }));

const { attachAgentWebSocketServer } = await import("./ws-agent.js");
const { broadcastAgentRegistered, broadcastActivity } = await import("./ws-ui.js");

function startTestServer(): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve) => {
    const server = http.createServer();
    attachAgentWebSocketServer(server);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve({ server, port: addr.port });
    });
  });
}

function connectAgent(port: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/agents`);
    ws.on("open", () => resolve(ws));
    ws.on("error", reject);
  });
}

function waitForBroadcast(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 20));
}

describe("ws-agent status tracking", () => {
  let server: http.Server;
  let port: number;

  beforeEach(async () => {
    vi.clearAllMocks();
    ({ server, port } = await startTestServer());
  });

  afterEach(() => {
    server.close();
  });

  it("registers agent with idle status", async () => {
    const ws = await connectAgent(port);
    ws.send(JSON.stringify({ type: "register", workspace: "ws-1", pid: 123, host: "host1" }));
    await waitForBroadcast();

    expect(agentDb.upsertAgent).toHaveBeenCalledWith(
      expect.objectContaining({ status: "idle", pid: 123, host: "host1" })
    );
    ws.close();
  });

  it("transitions agent to busy when activity message is received", async () => {
    const ws = await connectAgent(port);
    ws.send(JSON.stringify({ type: "register", workspace: "ws-1", pid: 456, host: "host1" }));
    await waitForBroadcast();

    ws.send(JSON.stringify({ type: "activity", kind: "in", msg: "Reading foo.ts" }));
    await waitForBroadcast();

    expect(agentDb.updateAgentStatus).toHaveBeenCalledWith(expect.any(String), "busy");
    ws.close();
  });

  it("transitions agent back to idle when heartbeat is received", async () => {
    const ws = await connectAgent(port);
    ws.send(JSON.stringify({ type: "register", workspace: "ws-1", pid: 789, host: "host1" }));
    await waitForBroadcast();

    ws.send(JSON.stringify({ type: "activity", kind: "in", msg: "file-edit" }));
    await waitForBroadcast();

    ws.send(JSON.stringify({ type: "heartbeat" }));
    await waitForBroadcast();

    const calls = (agentDb.updateAgentStatus as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0][1]).toBe("busy");
    expect(calls[1][1]).toBe("idle");
    ws.close();
  });

  it("deletes agent on disconnect and does not affect status tracking of other agents", async () => {
    const ws = await connectAgent(port);
    ws.send(JSON.stringify({ type: "register", workspace: "ws-1", pid: 999, host: "host1" }));
    await waitForBroadcast();

    ws.close();
    await waitForBroadcast();

    expect(agentDb.deleteAgent).toHaveBeenCalledWith(expect.any(String));
  });

  it("broadcasts activity event to UI clients with correct shape", async () => {
    const ws = await connectAgent(port);
    ws.send(JSON.stringify({ type: "register", workspace: "ws-1", pid: 111, host: "host1" }));
    await waitForBroadcast();

    ws.send(JSON.stringify({ type: "activity", kind: "note", msg: "tests passed" }));
    await waitForBroadcast();

    expect(broadcastActivity).toHaveBeenCalledWith(
      expect.any(String),
      "ws-1",
      "note",
      "tests passed",
    );
    ws.close();
  });

  it("broadcasts agent-registered event when agent registers", async () => {
    const ws = await connectAgent(port);
    ws.send(JSON.stringify({ type: "register", workspace: "ws-3", pid: 333, host: "host3" }));
    await waitForBroadcast();

    expect(broadcastAgentRegistered).toHaveBeenCalledWith(
      expect.any(String),
      "ws-3",
    );
    ws.close();
  });
});

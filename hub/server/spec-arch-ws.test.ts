import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { WebSocket } from "ws";

// Behavioural tests for the UI WebSocket endpoint (SPEC-arch-005/018/025/036/038),
// the agent WebSocket endpoint (SPEC-arch-006/028), and the chokidar watcher
// (SPEC-arch-004 success path / SPEC-arch-023). All run against real ws/chokidar
// modules; db and enrichment are mocked at the module boundary.

vi.mock("./db/index.js", () => ({
  getAllWorkspaces: () => [],
  getAllAgents: () => [{ id: "agt-1", workspace_id: "ws-1", pid: 1, host: "h", status: "idle", last_heartbeat: "", created_at: "", name: "claude-a", initials: "CA" }],
  upsertAgent: vi.fn(),
  updateAgentHeartbeat: vi.fn(),
  updateAgentStatus: vi.fn(),
  deleteAgent: vi.fn(),
}));

vi.mock("./workspace-data.js", () => ({
  getWorkspacesEnriched: () => [
    {
      id: "ws-1",
      name: "Repo",
      path: "/repo",
      description: null,
      created_at: "2026-01-01",
      counts: {
        targetsAwaitingUser: 1,
        targetsAwaitingAgent: 0,
        targetsReady: 0,
        targetsDraft: 0,
        specs: 2,
        specItems: 5,
        openGaps: 3,
        staleAuditDomains: 0,
        workPending: 0,
        workInProgress: 1,
        workBlocked: 0,
        workDoneToday: 0,
      },
      agents: ["agt-1"],
      lastActivity: "2026-01-02T00:00:00Z",
    },
  ],
}));

const { attachUiWebSocketServer, broadcastSddChanged, broadcastUpdate, broadcastAgentRegistered, broadcastActivity } =
  await import("./ws-ui.js");
const { attachAgentWebSocketServer } = await import("./ws-agent.js");
const { startWatcher } = await import("./watcher.js");

function startUiServer(): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve) => {
    const server = http.createServer();
    attachUiWebSocketServer(server);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve({ server, port: addr.port });
    });
  });
}

function startAgentServer(): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve) => {
    const server = http.createServer();
    attachAgentWebSocketServer(server);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve({ server, port: addr.port });
    });
  });
}

function connectUi(port: number): Promise<{ ws: WebSocket; first: Promise<any> }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    let resolveFirst: (v: any) => void;
    const first = new Promise<any>((r) => { resolveFirst = r; });
    ws.on("message", (d) => resolveFirst(JSON.parse(d.toString())));
    ws.on("open", () => resolve({ ws, first }));
    ws.on("error", reject);
  });
}

function nextMessage(ws: WebSocket): Promise<any> {
  return new Promise((resolve) => ws.once("message", (d) => resolve(JSON.parse(d.toString()))));
}

function connectAgent(port: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/agents`);
    ws.on("open", () => resolve(ws));
    ws.on("error", reject);
  });
}

function tick(ms = 25): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

describe("SPEC-arch-005/036: UI WebSocket endpoint sends enriched snapshot on connect", () => {
  let server: http.Server;
  let port: number;
  beforeEach(async () => { ({ server, port } = await startUiServer()); });
  afterEach(() => server.close());

  it("SPEC-arch-005: sends a full snapshot message immediately on connection", async () => {
    const { first, ws } = await connectUi(port);
    const snap = await first;
    expect(snap.type).toBe("snapshot");
    expect(Array.isArray(snap.workspaces)).toBe(true);
    expect(Array.isArray(snap.agents)).toBe(true);
    ws.close();
  });

  it("SPEC-arch-036: snapshot carries enriched WorkspaceData (counts, agents, lastActivity)", async () => {
    const { first, ws } = await connectUi(port);
    const snap = await first;
    const wsData = snap.workspaces[0];
    expect(wsData.counts).toBeDefined();
    expect(wsData.agents).toEqual(["agt-1"]);
    expect(wsData.lastActivity).toBe("2026-01-02T00:00:00Z");
    ws.close();
  });

  it("SPEC-arch-036: update message also carries enriched WorkspaceData", async () => {
    const { first, ws } = await connectUi(port);
    await first;
    const p = nextMessage(ws);
    broadcastUpdate("/repo/.sdd/targets/TGT-1.md");
    const msg = await p;
    expect(msg.type).toBe("update");
    expect(msg.workspaces[0].counts.openGaps).toBe(3);
    expect(msg.workspaces[0].lastActivity).toBe("2026-01-02T00:00:00Z");
    ws.close();
  });
});

describe("SPEC-arch-018/025/038: typed server→client messages", () => {
  let server: http.Server;
  let port: number;
  beforeEach(async () => { ({ server, port } = await startUiServer()); });
  afterEach(() => server.close());

  it("SPEC-arch-018: broadcasts sdd-changed with {type, workspaceId, artifact}", async () => {
    const { first, ws } = await connectUi(port);
    await first;
    const p = nextMessage(ws);
    broadcastSddChanged("ws-1", "gaps");
    const msg = await p;
    expect(msg).toEqual({ type: "sdd-changed", workspaceId: "ws-1", artifact: "gaps" });
    ws.close();
  });

  it("SPEC-arch-025/038: agent-registered message has {type, agentId, workspaceId}", async () => {
    const { first, ws } = await connectUi(port);
    await first;
    const p = nextMessage(ws);
    broadcastAgentRegistered("agt-9", "ws-1");
    const msg = await p;
    expect(msg).toEqual({ type: "agent-registered", agentId: "agt-9", workspaceId: "ws-1" });
    ws.close();
  });

  it("SPEC-arch-025/038: activity message has {type, agentId, workspaceId, kind, msg, t}", async () => {
    const { first, ws } = await connectUi(port);
    await first;
    const p = nextMessage(ws);
    broadcastActivity("agt-9", "ws-1", "note", "tests passed");
    const msg = await p;
    expect(msg.type).toBe("activity");
    expect(msg.agentId).toBe("agt-9");
    expect(msg.workspaceId).toBe("ws-1");
    expect(msg.kind).toBe("note");
    expect(msg.msg).toBe("tests passed");
    expect(typeof msg.t).toBe("string");
    ws.close();
  });
});

describe("SPEC-arch-006/028: agent WebSocket registration", () => {
  let server: http.Server;
  let port: number;
  let db: any;
  beforeEach(async () => {
    db = await import("./db/index.js");
    vi.mocked(db.upsertAgent).mockClear();
    ({ server, port } = await startAgentServer());
  });
  afterEach(() => server.close());

  it("SPEC-arch-006: an agent connects on /agents and registers with idle status, pid and host", async () => {
    const ws = await connectAgent(port);
    ws.send(JSON.stringify({ type: "register", workspace: "ws-1", pid: 321, host: "host9" }));
    await tick();
    expect(db.upsertAgent).toHaveBeenCalledWith(
      expect.objectContaining({ status: "idle", pid: 321, host: "host9", workspace_id: "ws-1" })
    );
    ws.close();
  });

  it("SPEC-arch-028: register without name derives name pid@host", async () => {
    const ws = await connectAgent(port);
    ws.send(JSON.stringify({ type: "register", workspace: "ws-1", pid: 42, host: "myhost" }));
    await tick();
    expect(db.upsertAgent).toHaveBeenCalledWith(expect.objectContaining({ name: "42@myhost" }));
    ws.close();
  });

  it("SPEC-arch-028: register with explicit name stores that name", async () => {
    const ws = await connectAgent(port);
    ws.send(JSON.stringify({ type: "register", workspace: "ws-1", pid: 42, host: "myhost", name: "claude-b" }));
    await tick();
    expect(db.upsertAgent).toHaveBeenCalledWith(expect.objectContaining({ name: "claude-b" }));
    ws.close();
  });
});

describe("SPEC-arch-004/023: chokidar watcher fires onChange and watches report files", () => {
  function makeWorkspace(): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-arch004-"));
    fs.mkdirSync(path.join(root, ".sdd", "targets"), { recursive: true });
    fs.mkdirSync(path.join(root, ".sdd", "specs", "architecture"), { recursive: true });
    return root;
  }

  it("SPEC-arch-004: onChange fires (debounced) when a file under .sdd changes", async () => {
    const ws = makeWorkspace();
    const changed: string[] = [];
    const stop = startWatcher(ws, (p) => changed.push(p));
    await tick(300);
    fs.writeFileSync(path.join(ws, ".sdd", "targets", "TGT-1.md"), "# T");
    await tick(450);
    stop();
    expect(changed.some((p) => p.includes("TGT-1.md"))).toBe(true);
  });

  it("SPEC-arch-023: onSpecsChanged fires when a declared report file changes", async () => {
    const ws = makeWorkspace();
    fs.mkdirSync(path.join(ws, "test-results"), { recursive: true });
    const reportPath = path.join(ws, "test-results", "vitest.json");
    fs.writeFileSync(reportPath, "{}");
    fs.writeFileSync(
      path.join(ws, ".sdd", "specs", "architecture", "SPEC-arch.tests.json"),
      JSON.stringify({ runner: "vitest", report: "test-results/vitest.json", items: {} })
    );
    const calls: number[] = [];
    const stop = startWatcher(ws, () => {}, () => calls.push(Date.now()));
    await tick(500);
    fs.writeFileSync(reportPath, '{"startTime":1}');
    await tick(450);
    stop();
    expect(calls.length).toBeGreaterThanOrEqual(1);
  });
});

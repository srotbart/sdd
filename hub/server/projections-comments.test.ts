import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

vi.mock("./watcher.js", () => ({
  startWatcher: vi.fn(() => vi.fn()),
}));

vi.mock("./ws-ui.js", () => ({
  attachUiWebSocketServer: vi.fn(),
  broadcastUpdate: vi.fn(),
  broadcastSddChanged: vi.fn(),
  broadcastRaw: vi.fn(),
}));

vi.mock("./ws-agent.js", () => ({
  attachAgentWebSocketServer: vi.fn(),
}));

vi.mock("./sdd-artifact.js", () => ({
  resolveArtifact: vi.fn(() => null),
}));

vi.mock("./sdd-parser.js", () => ({
  parseTargets: vi.fn(() => []),
  parseGaps: vi.fn(() => []),
  parseWorkItems: vi.fn(() => []),
  parseSpecs: vi.fn(() => []),
}));

const dbMocks = {
  getDb: vi.fn(),
  getAllWorkspaces: vi.fn(() => []),
  getWorkspaceById: vi.fn(),
  updateWorkspace: vi.fn(),
  insertWorkspace: vi.fn(),
  getRecentWorkspaces: vi.fn(() => []),
  getAgentIdsByWorkspace: vi.fn(() => new Map()),
  getAllAgents: vi.fn(() => []),
  upsertAgent: vi.fn(),
  updateAgentHeartbeat: vi.fn(),
  updateAgentStatus: vi.fn(),
  deleteAgent: vi.fn(),
  computeInitials: vi.fn((n: string) => n[0]?.toUpperCase() ?? ""),
};

vi.mock("./db/index.js", () => dbMocks);

vi.mock("./workspace-data.js", () => ({
  getWorkspacesEnriched: vi.fn(() => []),
}));

const { server } = await import("./index.js");

function startServer(): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve(addr.port);
    });
  });
}

function stopServer(): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

let tmpRoot: string;
let port: number;

beforeEach(async () => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-comments-test-"));
  port = await startServer();
});

afterEach(async () => {
  await stopServer();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  vi.mocked(dbMocks.getWorkspaceById).mockReset();
});

const sampleEntry = {
  id: "cmt-001",
  action: "clarify" as const,
  selectedText: "some text",
  line: 5,
  note: "please clarify this",
  createdAt: "2026-06-05T00:00:00Z",
};

describe("Projection comments endpoints — SPEC-arch-042", () => {
  it("GET returns [] when comments file is absent", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({
      id: "ws-1",
      name: "Test",
      path: tmpRoot,
      description: null,
    });
    const projectionsDir = path.join(tmpRoot, ".sdd", "projections");
    fs.mkdirSync(projectionsDir, { recursive: true });
    // Only create the .md file, not the .comments.json
    fs.writeFileSync(path.join(projectionsDir, "overview.md"), "# Overview");

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections/overview/comments`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("GET returns [] when .sdd/projections/ does not exist at all", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({
      id: "ws-1",
      name: "Test",
      path: tmpRoot,
      description: null,
    });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections/overview/comments`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("PUT writes entries; subsequent GET returns them", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({
      id: "ws-1",
      name: "Test",
      path: tmpRoot,
      description: null,
    });
    const entries = [sampleEntry];

    const putRes = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections/overview/comments`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entries),
    });
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody).toEqual(entries);

    // Confirm file was written
    const commentsPath = path.join(tmpRoot, ".sdd", "projections", "overview.comments.json");
    expect(fs.existsSync(commentsPath)).toBe(true);

    // GET returns the same entries
    const getRes = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections/overview/comments`);
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody).toEqual(entries);
  });

  it("PUT creates .sdd/projections/ directory if absent", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({
      id: "ws-1",
      name: "Test",
      path: tmpRoot,
      description: null,
    });

    const putRes = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections/newproj/comments`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([sampleEntry]),
    });
    expect(putRes.status).toBe(200);

    const commentsPath = path.join(tmpRoot, ".sdd", "projections", "newproj.comments.json");
    expect(fs.existsSync(commentsPath)).toBe(true);
  });

  it("DELETE removes the correct entry by id; GET confirms removal", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({
      id: "ws-1",
      name: "Test",
      path: tmpRoot,
      description: null,
    });
    const second = { ...sampleEntry, id: "cmt-002", note: "second note" };
    const projectionsDir = path.join(tmpRoot, ".sdd", "projections");
    fs.mkdirSync(projectionsDir, { recursive: true });
    fs.writeFileSync(
      path.join(projectionsDir, "overview.comments.json"),
      JSON.stringify([sampleEntry, second]),
      "utf-8",
    );

    const delRes = await fetch(
      `http://127.0.0.1:${port}/workspaces/ws-1/projections/overview/comments/cmt-001`,
      { method: "DELETE" },
    );
    expect(delRes.status).toBe(200);
    const delBody = await delRes.json();
    expect(delBody).toEqual([second]);

    // GET confirms removal
    const getRes = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections/overview/comments`);
    const getBody = await getRes.json();
    expect(getBody).toEqual([second]);
  });

  it("DELETE returns 404 for unknown commentId", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({
      id: "ws-1",
      name: "Test",
      path: tmpRoot,
      description: null,
    });
    const projectionsDir = path.join(tmpRoot, ".sdd", "projections");
    fs.mkdirSync(projectionsDir, { recursive: true });
    fs.writeFileSync(
      path.join(projectionsDir, "overview.comments.json"),
      JSON.stringify([sampleEntry]),
      "utf-8",
    );

    const res = await fetch(
      `http://127.0.0.1:${port}/workspaces/ws-1/projections/overview/comments/does-not-exist`,
      { method: "DELETE" },
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toMatchObject({ error: "comment not found" });
  });

  it("path traversal in :name returns 400", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({
      id: "ws-1",
      name: "Test",
      path: tmpRoot,
      description: null,
    });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections/..%2Fsecret/comments`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ error: "invalid projection name" });
  });

  it("unknown workspace id returns 404 on GET", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue(undefined);

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/no-such-ws/projections/overview/comments`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toMatchObject({ error: "workspace not found" });
  });

  it("unknown workspace id returns 404 on PUT", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue(undefined);

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/no-such-ws/projections/overview/comments`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toMatchObject({ error: "workspace not found" });
  });

  it("unknown workspace id returns 404 on DELETE", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue(undefined);

    const res = await fetch(
      `http://127.0.0.1:${port}/workspaces/no-such-ws/projections/overview/comments/cmt-001`,
      { method: "DELETE" },
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toMatchObject({ error: "workspace not found" });
  });

  it("PUT returns 400 for invalid JSON body", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({
      id: "ws-1",
      name: "Test",
      path: tmpRoot,
      description: null,
    });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections/overview/comments`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "not-valid-json",
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ error: "invalid JSON body" });
  });
});

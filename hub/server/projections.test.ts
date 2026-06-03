import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import http from "node:http";
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
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-proj-test-"));
  port = await startServer();
});

afterEach(async () => {
  await stopServer();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  vi.mocked(dbMocks.getWorkspaceById).mockReset();
});

describe("GET /workspaces/:id/projections — SPEC-scr-040", () => {
  it("returns empty array when .sdd/projections/ does not exist", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({ id: "ws-1", name: "Test", path: tmpRoot, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns name and lastModified for each .md file in .sdd/projections/", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({ id: "ws-1", name: "Test", path: tmpRoot, description: null });
    const projectionsDir = path.join(tmpRoot, ".sdd", "projections");
    fs.mkdirSync(projectionsDir, { recursive: true });
    fs.writeFileSync(path.join(projectionsDir, "overview.md"), "# Overview\n\nContent here.");
    fs.writeFileSync(path.join(projectionsDir, "status.md"), "# Status\n\nAll good.");

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections`);
    expect(res.status).toBe(200);
    const body = await res.json() as { name: string; lastModified: string }[];
    expect(body).toHaveLength(2);
    const names = body.map((p) => p.name).sort();
    expect(names).toEqual(["overview", "status"]);
    expect(typeof body[0].lastModified).toBe("string");
    expect(new Date(body[0].lastModified).toISOString()).toBe(body[0].lastModified);
  });

  it("returns 404 when workspace is not found", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue(undefined);

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/unknown/projections`);
    expect(res.status).toBe(404);
  });
});

describe("GET /workspaces/:id/projections/:name — SPEC-scr-040", () => {
  it("returns raw markdown content of the named projection", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({ id: "ws-1", name: "Test", path: tmpRoot, description: null });
    const projectionsDir = path.join(tmpRoot, ".sdd", "projections");
    fs.mkdirSync(projectionsDir, { recursive: true });
    fs.writeFileSync(path.join(projectionsDir, "overview.md"), "# Overview\n\nContent here.");

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections/overview`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("# Overview\n\nContent here.");
  });

  it("returns 404 when the named projection file does not exist", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({ id: "ws-1", name: "Test", path: tmpRoot, description: null });
    fs.mkdirSync(path.join(tmpRoot, ".sdd", "projections"), { recursive: true });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/projections/nonexistent`);
    expect(res.status).toBe(404);
  });

  it("returns 404 when workspace is not found", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue(undefined);

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/unknown/projections/overview`);
    expect(res.status).toBe(404);
  });
});

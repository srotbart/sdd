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
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-designs-test-"));
  port = await startServer();
});

afterEach(async () => {
  await stopServer();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  vi.mocked(dbMocks.getWorkspaceById).mockReset();
});

describe("GET /workspaces/:id/designs — SPEC-scr-042", () => {
  it("returns empty array when .sdd/design/ does not exist", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({ id: "ws-1", name: "Test", path: tmpRoot, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/designs`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns name and lastModified for each subdirectory containing design.md", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({ id: "ws-1", name: "Test", path: tmpRoot, description: null });
    const designDir = path.join(tmpRoot, ".sdd", "design");
    fs.mkdirSync(path.join(designDir, "auth-flow"), { recursive: true });
    fs.writeFileSync(path.join(designDir, "auth-flow", "design.md"), "# Auth Flow\n\nDesign content.");
    fs.mkdirSync(path.join(designDir, "dashboard"), { recursive: true });
    fs.writeFileSync(path.join(designDir, "dashboard", "design.md"), "# Dashboard\n\nDesign content.");

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/designs`);
    expect(res.status).toBe(200);
    const body = await res.json() as { name: string; lastModified: string }[];
    expect(body).toHaveLength(2);
    const names = body.map((d) => d.name).sort();
    expect(names).toEqual(["auth-flow", "dashboard"]);
    expect(typeof body[0].lastModified).toBe("string");
    expect(new Date(body[0].lastModified).toISOString()).toBe(body[0].lastModified);
  });

  it("skips subdirectories that do not contain design.md", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({ id: "ws-1", name: "Test", path: tmpRoot, description: null });
    const designDir = path.join(tmpRoot, ".sdd", "design");
    fs.mkdirSync(path.join(designDir, "incomplete"), { recursive: true });
    fs.mkdirSync(path.join(designDir, "with-design"), { recursive: true });
    fs.writeFileSync(path.join(designDir, "with-design", "design.md"), "# With Design");

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/designs`);
    expect(res.status).toBe(200);
    const body = await res.json() as { name: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("with-design");
  });

  it("returns 404 when workspace is not found", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue(undefined);

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/unknown/designs`);
    expect(res.status).toBe(404);
  });
});

describe("GET /workspaces/:id/designs/:name — SPEC-scr-042", () => {
  it("returns raw markdown content of design.md for the named design", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({ id: "ws-1", name: "Test", path: tmpRoot, description: null });
    const designDir = path.join(tmpRoot, ".sdd", "design", "auth-flow");
    fs.mkdirSync(designDir, { recursive: true });
    fs.writeFileSync(path.join(designDir, "design.md"), "# Auth Flow\n\nDesign content.");

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/designs/auth-flow`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("# Auth Flow\n\nDesign content.");
  });

  it("returns 404 when the named design does not exist", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({ id: "ws-1", name: "Test", path: tmpRoot, description: null });
    fs.mkdirSync(path.join(tmpRoot, ".sdd", "design"), { recursive: true });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/designs/nonexistent`);
    expect(res.status).toBe(404);
  });

  it("returns 404 when workspace is not found", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue(undefined);

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/unknown/designs/auth-flow`);
    expect(res.status).toBe(404);
  });

  it("rejects a path-traversal design name with 400 (SPEC-arch-042)", async () => {
    vi.mocked(dbMocks.getWorkspaceById).mockReturnValue({ id: "ws-1", name: "Test", path: tmpRoot, description: null });
    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-1/designs/..%5C..%5Csecret`);
    expect(res.status).toBe(400);
  });
});

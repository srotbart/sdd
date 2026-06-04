import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// HTTP-route coverage for the SPEC-arch domain. Mirrors designs.test.ts: mock
// the watcher / ws / artifact layers, drive the REAL http server (imported from
// index.ts) with fetch, and back it with an in-memory SQLite db plus a temp
// .sdd/ tree so route handlers, the db layer, the parsers and the enrichment
// layer all run for real.

vi.mock("./watcher.js", () => ({
  startWatcher: vi.fn(() => vi.fn()),
}));
vi.mock("./ws-ui.js", () => ({
  attachUiWebSocketServer: vi.fn(),
  broadcastUpdate: vi.fn(),
  broadcastSddChanged: vi.fn(),
  broadcastAgentRegistered: vi.fn(),
  broadcastActivity: vi.fn(),
}));
vi.mock("./ws-agent.js", () => ({
  attachAgentWebSocketServer: vi.fn(),
}));

process.env["SDD_DB_PATH"] = ":memory:";

const { server, watcherRegistry } = await import("./index.js");
const watcherMod = await import("./watcher.js");
const { insertWorkspace, getAllWorkspaces, closeDb } = await import("./db/index.js");

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

let port: number;
let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-arch-http-"));
  // Reset db state between tests.
  for (const ws of getAllWorkspaces()) {
    const { getDb } = await import("./db/index.js");
    getDb().prepare("DELETE FROM workspaces WHERE id = ?").run(ws.id);
  }
  watcherRegistry.clear();
  vi.mocked(watcherMod.startWatcher).mockClear();
  port = await startServer();
});

afterEach(async () => {
  await stopServer();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

function makeSdd(wsPath: string): void {
  fs.mkdirSync(path.join(wsPath, ".sdd"), { recursive: true });
}

// ---------------------------------------------------------------------------
// SPEC-arch-010 — GET /workspaces returns workspaces from SQLite (enriched)
// SPEC-arch-030 — GET /workspaces returns enriched WorkspaceData
// SPEC-arch-037 — WorkspaceCounts includes all 12 fields
// ---------------------------------------------------------------------------
describe("SPEC-arch-010/030/037: GET /workspaces", () => {
  it("SPEC-arch-010: returns a JSON array of workspaces from SQLite with application/json content-type", async () => {
    const wsPath = path.join(tmpRoot, "repo-a");
    makeSdd(wsPath);
    insertWorkspace({ id: "ws-a", name: "A", path: wsPath, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = (await res.json()) as Array<{ id: string }>;
    expect(body.map((w) => w.id)).toContain("ws-a");
  });

  it("SPEC-arch-030: each workspace entry is enriched with counts, agents and lastActivity", async () => {
    const wsPath = path.join(tmpRoot, "repo-b");
    makeSdd(wsPath);
    insertWorkspace({ id: "ws-b", name: "B", path: wsPath, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces`);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    const entry = body.find((w) => w["id"] === "ws-b")!;
    expect(entry["counts"]).toBeDefined();
    expect(Array.isArray(entry["agents"])).toBe(true);
    expect(typeof entry["lastActivity"]).toBe("string");
  });

  it("SPEC-arch-037: counts object includes all 12 fields, each a number (0 not undefined)", async () => {
    const wsPath = path.join(tmpRoot, "repo-c");
    makeSdd(wsPath);
    insertWorkspace({ id: "ws-c", name: "C", path: wsPath, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces`);
    const body = (await res.json()) as Array<{ id: string; counts: Record<string, unknown> }>;
    const counts = body.find((w) => w.id === "ws-c")!.counts;
    const expectedFields = [
      "targetsAwaitingUser", "targetsAwaitingAgent", "targetsReady", "targetsDraft",
      "specs", "specItems", "openGaps", "staleAuditDomains",
      "workPending", "workInProgress", "workBlocked", "workDoneToday",
    ];
    for (const field of expectedFields) {
      expect(typeof counts[field]).toBe("number");
    }
    expect(Object.keys(counts)).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-011 — PATCH /workspaces/:id persists field changes; 404 / 400
// ---------------------------------------------------------------------------
describe("SPEC-arch-011: PATCH /workspaces/:id", () => {
  it("SPEC-arch-011: updates only provided fields and returns the updated workspace JSON", async () => {
    const wsPath = path.join(tmpRoot, "repo-patch");
    makeSdd(wsPath);
    insertWorkspace({ id: "ws-patch", name: "Old", path: wsPath, description: "d" });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-patch`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name: string; description: string; path: string };
    expect(body.name).toBe("New");
    expect(body.description).toBe("d");
    expect(body.path).toBe(wsPath);
  });

  it("SPEC-arch-011: returns 404 for an unknown workspace id", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/workspaces/nope`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });
    expect(res.status).toBe(404);
  });

  it("SPEC-arch-011: returns 400 for an invalid JSON body", async () => {
    insertWorkspace({ id: "ws-bad", name: "X", path: path.join(tmpRoot, "bad"), description: null });
    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-bad`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-034 — PATCH path change swaps the watcher
// ---------------------------------------------------------------------------
describe("SPEC-arch-034: PATCH /workspaces/:id swaps watcher on path change", () => {
  it("SPEC-arch-034: changing path stops old watcher and starts a new one", async () => {
    const oldPath = path.join(tmpRoot, "old-ws");
    const newPath = path.join(tmpRoot, "new-ws");
    makeSdd(oldPath);
    makeSdd(newPath);
    const oldCleanup = vi.fn();
    insertWorkspace({ id: "ws-sw", name: "SW", path: oldPath, description: null });
    watcherRegistry.set("ws-sw", oldCleanup);

    const newCleanup = vi.fn();
    vi.mocked(watcherMod.startWatcher).mockReturnValueOnce(newCleanup);

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-sw`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: newPath }),
    });
    expect(res.status).toBe(200);
    expect(oldCleanup).toHaveBeenCalled();
    expect(watcherMod.startWatcher).toHaveBeenCalledWith(newPath, expect.any(Function), expect.any(Function));
    expect(watcherRegistry.get("ws-sw")).toBe(newCleanup);
  });

  it("SPEC-arch-034: leaves the watcher untouched when path is not in the PATCH body", async () => {
    const wsPath = path.join(tmpRoot, "stable-ws");
    makeSdd(wsPath);
    const cleanup = vi.fn();
    insertWorkspace({ id: "ws-stable", name: "S", path: wsPath, description: null });
    watcherRegistry.set("ws-stable", cleanup);
    vi.mocked(watcherMod.startWatcher).mockClear();

    await fetch(`http://127.0.0.1:${port}/workspaces/ws-stable`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "renamed" }),
    });
    expect(watcherMod.startWatcher).not.toHaveBeenCalled();
    expect(cleanup).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-032 — POST /workspaces creates, validates, starts watcher, 201
// SPEC-arch-033 — POST /workspaces returns 409 on duplicate path
// ---------------------------------------------------------------------------
describe("SPEC-arch-032/033: POST /workspaces", () => {
  it("SPEC-arch-032: creates a workspace, starts a watcher, returns 201 with created row", async () => {
    const wsPath = path.join(tmpRoot, "created");
    makeSdd(wsPath);
    const res = await fetch(`http://127.0.0.1:${port}/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Created", path: wsPath }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string; name: string; path: string; created_at: string };
    expect(body.name).toBe("Created");
    expect(body.path).toBe(wsPath);
    expect(typeof body.id).toBe("string");
    expect(typeof body.created_at).toBe("string");
    expect(watcherMod.startWatcher).toHaveBeenCalledWith(wsPath, expect.any(Function), expect.any(Function));
    expect(watcherRegistry.has(body.id)).toBe(true);
  });

  it("SPEC-arch-032: returns 400 when name or path is missing or non-string", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "OnlyName" }),
    });
    expect(res.status).toBe(400);
  });

  it("SPEC-arch-033: returns 409 with the canonical error when path already exists", async () => {
    const wsPath = path.join(tmpRoot, "dup");
    makeSdd(wsPath);
    insertWorkspace({ id: "ws-existing", name: "Existing", path: wsPath, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Dup", path: wsPath }),
    });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("workspace with this path already exists");
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-013 — GET /workspaces/:id/specs (parsed specs, 404, testStatus)
// SPEC-arch-024 — every SpecItem includes testStatus
// ---------------------------------------------------------------------------
describe("SPEC-arch-013/024: GET /workspaces/:id/specs", () => {
  const SPEC_ITEM = `---
id: SPEC-foo-001
domain: foo
abbrev: foo
status: active
version: "deadbeef"
---

# SPEC-foo-001 — A foo invariant

The foo must bar.

## Invariant
foo bars.
`;

  it("SPEC-arch-013: returns parsed spec items as JSON for a known workspace", async () => {
    const wsPath = path.join(tmpRoot, "specs-ws");
    const domainDir = path.join(wsPath, ".sdd", "specs", "foo");
    fs.mkdirSync(domainDir, { recursive: true });
    fs.writeFileSync(path.join(domainDir, "SPEC-foo-001.md"), SPEC_ITEM);
    insertWorkspace({ id: "ws-specs", name: "S", path: wsPath, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-specs/specs`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ id: string; items: Array<{ id: string }> }>;
    expect(body).toHaveLength(1);
    expect(body[0].items[0].id).toBe("SPEC-FOO-001");
  });

  it("SPEC-arch-024: every returned SpecItem includes a testStatus field (default not-run)", async () => {
    const wsPath = path.join(tmpRoot, "specs-ts");
    const domainDir = path.join(wsPath, ".sdd", "specs", "foo");
    fs.mkdirSync(domainDir, { recursive: true });
    fs.writeFileSync(path.join(domainDir, "SPEC-foo-001.md"), SPEC_ITEM);
    insertWorkspace({ id: "ws-ts", name: "S", path: wsPath, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-ts/specs`);
    const body = (await res.json()) as Array<{ items: Array<{ testStatus: { status: string } }> }>;
    expect(body[0].items[0].testStatus.status).toBe("not-run");
  });

  it("SPEC-arch-013: returns 404 for an unknown workspace", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/workspaces/unknown/specs`);
    expect(res.status).toBe(404);
  });

  it("SPEC-arch-013: returns empty array when no spec files exist", async () => {
    const wsPath = path.join(tmpRoot, "specs-empty");
    makeSdd(wsPath);
    insertWorkspace({ id: "ws-empty", name: "E", path: wsPath, description: null });
    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-empty/specs`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-014 — GET /workspaces/:id/targets
// ---------------------------------------------------------------------------
describe("SPEC-arch-014: GET /workspaces/:id/targets", () => {
  const TARGET = `---
id: TGT-001
status: ready
created: 2026-05-01
domain: architecture
---

# Target: Foo

## Current statement
Do the thing.
`;

  it("SPEC-arch-014: returns parsed targets as JSON with application/json content-type", async () => {
    const wsPath = path.join(tmpRoot, "tg-ws");
    const dir = path.join(wsPath, ".sdd", "targets");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "TGT-001.md"), TARGET);
    insertWorkspace({ id: "ws-tg", name: "T", path: wsPath, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-tg/targets`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = (await res.json()) as Array<{ id: string; status: string; statement: string }>;
    expect(body[0]).toMatchObject({ id: "TGT-001", status: "ready", statement: "Do the thing." });
  });

  it("SPEC-arch-014: returns 404 for unknown workspace and empty array when no targets", async () => {
    const res404 = await fetch(`http://127.0.0.1:${port}/workspaces/nope/targets`);
    expect(res404.status).toBe(404);

    const wsPath = path.join(tmpRoot, "tg-empty");
    makeSdd(wsPath);
    insertWorkspace({ id: "ws-tge", name: "E", path: wsPath, description: null });
    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-tge/targets`);
    expect(await res.json()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-015 — GET /workspaces/:id/gaps
// ---------------------------------------------------------------------------
describe("SPEC-arch-015: GET /workspaces/:id/gaps", () => {
  const GAP = `---
id: GAP-arch-001
spec-item: SPEC-arch-015
domain: architecture
status: open
discovered: "2026-05-01T00:00:00Z"
audit-spec-version: "v1"
closed-by: null
deferred-reason: null
---

# Gap: missing endpoint

**Location:** hub/server/index.ts

**Reasoning:** No handler.
`;

  it("SPEC-arch-015: returns parsed gaps with mapped fields (auditVersion, closedBy, location, reasoning)", async () => {
    const wsPath = path.join(tmpRoot, "gap-ws");
    const dir = path.join(wsPath, ".sdd", "gaps");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "GAP-arch-001.md"), GAP);
    insertWorkspace({ id: "ws-gap", name: "G", path: wsPath, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-gap/gaps`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body[0]).toMatchObject({
      id: "GAP-arch-001",
      specItem: "SPEC-arch-015",
      auditVersion: "v1",
      closedBy: null,
      title: "missing endpoint",
      location: "hub/server/index.ts",
      reasoning: "No handler.",
    });
  });

  it("SPEC-arch-015: returns 404 for an unknown workspace", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/workspaces/nope/gaps`);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-016 — GET /workspaces/:id/work-items
// ---------------------------------------------------------------------------
describe("SPEC-arch-016: GET /workspaces/:id/work-items", () => {
  const WI = `---
id: WI-arch-001
gap-id: GAP-arch-001
domain: architecture
status: pending
created: "2026-05-01T00:00:00Z"
abandoned-reason: null
---

# Work Item: implement endpoint

**Scope:** \`hub/server/index.ts\` — add route

**Acceptance criteria:**
- returns JSON
- returns 404 for unknown id
`;

  it("SPEC-arch-016: returns parsed work items with gapId, scope and acceptance bullets", async () => {
    const wsPath = path.join(tmpRoot, "wi-ws");
    const dir = path.join(wsPath, ".sdd", "work-items");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "WI-arch-001.md"), WI);
    insertWorkspace({ id: "ws-wi", name: "W", path: wsPath, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/workspaces/ws-wi/work-items`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body[0]).toMatchObject({
      id: "WI-arch-001",
      gapId: "GAP-arch-001",
      status: "pending",
      title: "implement endpoint",
    });
    expect(body[0]["acceptance"]).toEqual(["returns JSON", "returns 404 for unknown id"]);
  });

  it("SPEC-arch-016: returns 404 for an unknown workspace", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/workspaces/nope/work-items`);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-039 — GET /recent-workspaces
// ---------------------------------------------------------------------------
describe("SPEC-arch-039: GET /recent-workspaces", () => {
  it("SPEC-arch-039: returns most recent workspaces newest-first with id/name/path/hasSdd", async () => {
    const p1 = path.join(tmpRoot, "rw1");
    const p2 = path.join(tmpRoot, "rw2");
    makeSdd(p2); // only p2 has .sdd
    fs.mkdirSync(p1, { recursive: true });
    insertWorkspace({ id: "rw-1", name: "RW1", path: p1, description: null });
    insertWorkspace({ id: "rw-2", name: "RW2", path: p2, description: null });

    const res = await fetch(`http://127.0.0.1:${port}/recent-workspaces`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ id: string; name: string; path: string; hasSdd: boolean }>;
    expect(body[0].id).toBe("rw-2");
    expect(body[0].hasSdd).toBe(true);
    const first = body.find((w) => w.id === "rw-1")!;
    expect(first.hasSdd).toBe(false);
    expect(typeof first.name).toBe("string");
    expect(typeof first.path).toBe("string");
  });

  it("SPEC-arch-039: returns empty array when no workspaces exist", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/recent-workspaces`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});

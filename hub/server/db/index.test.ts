import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import {
  getDb,
  closeDb,
  insertWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  getRecentWorkspaces,
  updateWorkspace,
  upsertAgent,
  getAllAgents,
  computeInitials,
} from "./index.js";

beforeEach(() => {
  process.env["SDD_DB_PATH"] = ":memory:";
});

afterEach(() => {
  closeDb();
});

describe("better-sqlite3 driver", () => {
  it("getDb() returns a better-sqlite3 Database instance", () => {
    expect(getDb()).toBeInstanceOf(Database);
  });
});

describe("computeInitials", () => {
  it("returns first char of each word, uppercased, max 2 chars — claude-a → CA", () => {
    expect(computeInitials("claude-a")).toBe("CA");
  });

  it("single word returns one char", () => {
    expect(computeInitials("alice")).toBe("A");
  });

  it("three words returns first two chars only", () => {
    expect(computeInitials("alpha beta gamma")).toBe("AB");
  });

  it("empty string returns empty string", () => {
    expect(computeInitials("")).toBe("");
  });
});

describe("agent name and initials", () => {
  beforeEach(() => {
    insertWorkspace({ id: "ws-a", name: "Repo", path: "/repo", description: null });
  });

  it("agent registered without name stores derived pid@host as name", () => {
    upsertAgent({ id: "agt-1", workspace_id: "ws-a", pid: 42, host: "myhost", status: "idle", name: "42@myhost" });
    const agents = getAllAgents();
    expect(agents[0].name).toBe("42@myhost");
  });

  it("agent registered with explicit name stores that name", () => {
    upsertAgent({ id: "agt-2", workspace_id: "ws-a", pid: 99, host: "h", status: "idle", name: "claude-b" });
    const agents = getAllAgents();
    expect(agents[0].name).toBe("claude-b");
  });

  it("getAllAgents returns initials field computed from name", () => {
    upsertAgent({ id: "agt-3", workspace_id: "ws-a", pid: 7, host: "h", status: "idle", name: "sdd worker" });
    const agents = getAllAgents();
    expect(agents[0].initials).toBe("SW");
  });

  it("getAllAgents backfills empty-name row with pid@host and non-empty initials", () => {
    getDb().prepare(
      `INSERT INTO agents (id, workspace_id, pid, host, status, name) VALUES (?, ?, ?, ?, ?, ?)`
    ).run("agt-empty", "ws-a", 55, "devbox", "idle", "");
    const agents = getAllAgents();
    const agent = agents.find((a) => a.id === "agt-empty");
    expect(agent?.name).toBe("55@devbox");
    expect(agent?.initials).not.toBe("");
  });

  it("getAllAgents does not alter a row that already has an explicit name", () => {
    upsertAgent({ id: "agt-named", workspace_id: "ws-a", pid: 10, host: "box", status: "idle", name: "claude-a" });
    const agents = getAllAgents();
    const agent = agents.find((a) => a.id === "agt-named");
    expect(agent?.name).toBe("claude-a");
  });
});

describe("getRecentWorkspaces", () => {
  it("returns empty array when no workspaces exist", () => {
    expect(getRecentWorkspaces(5)).toEqual([]);
  });

  it("returns workspaces ordered by created_at descending", () => {
    insertWorkspace({ id: "ws-old", name: "Old", path: "/old", description: null });
    insertWorkspace({ id: "ws-new", name: "New", path: "/new", description: null });
    const recent = getRecentWorkspaces(5);
    expect(recent[0].id).toBe("ws-new");
    expect(recent[1].id).toBe("ws-old");
  });

  it("limits results to the requested count", () => {
    for (let i = 0; i < 7; i++) {
      insertWorkspace({ id: `ws-lim-${i}`, name: `W${i}`, path: `/p${i}`, description: null });
    }
    expect(getRecentWorkspaces(5)).toHaveLength(5);
  });
});

describe("insertWorkspace duplicate path behaviour", () => {
  it("throws a UNIQUE constraint error when the same path is inserted twice", () => {
    insertWorkspace({ id: "ws-dup-1", name: "First", path: "/same/path", description: null });
    expect(() => {
      insertWorkspace({ id: "ws-dup-2", name: "Second", path: "/same/path", description: null });
    }).toThrow(/UNIQUE constraint failed/);
  });

  it("succeeds and returns the inserted workspace for a unique path", () => {
    insertWorkspace({ id: "ws-uniq-1", name: "Unique", path: "/unique/path", description: null });
    const ws = getWorkspaceById("ws-uniq-1");
    expect(ws).toBeDefined();
    expect(ws?.path).toBe("/unique/path");
  });
});

describe("workspace CRUD", () => {
  it("getAllWorkspaces returns empty array when no workspaces exist", () => {
    expect(getAllWorkspaces()).toEqual([]);
  });

  it("insertWorkspace then getAllWorkspaces returns the inserted row", () => {
    insertWorkspace({ id: "ws-1", name: "My Repo", path: "/tmp/my-repo", description: null });
    const all = getAllWorkspaces();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ id: "ws-1", name: "My Repo", path: "/tmp/my-repo" });
  });

  it("getWorkspaceById returns undefined for an unknown id", () => {
    expect(getWorkspaceById("does-not-exist")).toBeUndefined();
  });

  it("getWorkspaceById returns the workspace after insert", () => {
    insertWorkspace({ id: "ws-2", name: "Test", path: "/tmp/test", description: "a desc" });
    const ws = getWorkspaceById("ws-2");
    expect(ws).toBeDefined();
    expect(ws?.name).toBe("Test");
    expect(ws?.description).toBe("a desc");
  });

  it("updateWorkspace persists field changes without touching other fields", () => {
    insertWorkspace({ id: "ws-3", name: "Old", path: "/tmp/old", description: null });
    updateWorkspace("ws-3", { name: "New", description: "updated" });
    const ws = getWorkspaceById("ws-3");
    expect(ws?.name).toBe("New");
    expect(ws?.description).toBe("updated");
    expect(ws?.path).toBe("/tmp/old");
  });
});

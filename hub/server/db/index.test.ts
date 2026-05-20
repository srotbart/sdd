import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import {
  getDb,
  closeDb,
  insertWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
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

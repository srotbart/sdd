import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { closeDb, insertWorkspace } from "./db/index.js";

let tmpRoot: string;

beforeEach(() => {
  process.env["SDD_DB_PATH"] = ":memory:";
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "recent-ws-test-"));
});

afterEach(() => {
  closeDb();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

async function callRecentWorkspaces(): Promise<unknown> {
  const { getRecentWorkspaces } = await import("./db/index.js");
  const { existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  return getRecentWorkspaces(5).map((ws) => ({
    id: ws.id,
    name: ws.name,
    path: ws.path,
    hasSdd: existsSync(join(ws.path, ".sdd")),
  }));
}

describe("GET /recent-workspaces — server logic (SPEC-arch-039)", () => {
  it("returns empty array when no workspaces exist", async () => {
    const result = await callRecentWorkspaces();
    expect(result).toEqual([]);
  });

  it("returns up to 5 most recent workspaces ordered by created_at descending", async () => {
    for (let i = 0; i < 7; i++) {
      insertWorkspace({ id: `ws-${i}`, name: `Repo${i}`, path: `${tmpRoot}/p${i}`, description: null });
    }
    const result = await callRecentWorkspaces() as Array<{ id: string }>;
    expect(result).toHaveLength(5);
    expect(result[0].id).toBe("ws-6");
  });

  it("hasSdd is true when {path}/.sdd/ exists on disk", async () => {
    const wsPath = path.join(tmpRoot, "with-sdd");
    fs.mkdirSync(path.join(wsPath, ".sdd"), { recursive: true });
    insertWorkspace({ id: "ws-has-sdd", name: "HasSdd", path: wsPath, description: null });
    const result = await callRecentWorkspaces() as Array<{ id: string; hasSdd: boolean }>;
    expect(result[0].hasSdd).toBe(true);
  });

  it("hasSdd is false when {path}/.sdd/ does not exist on disk", async () => {
    const wsPath = path.join(tmpRoot, "no-sdd");
    fs.mkdirSync(wsPath, { recursive: true });
    insertWorkspace({ id: "ws-no-sdd", name: "NoSdd", path: wsPath, description: null });
    const result = await callRecentWorkspaces() as Array<{ id: string; hasSdd: boolean }>;
    expect(result[0].hasSdd).toBe(false);
  });

  it("each entry includes id, name, path, and hasSdd fields", async () => {
    const wsPath = path.join(tmpRoot, "typed");
    fs.mkdirSync(wsPath, { recursive: true });
    insertWorkspace({ id: "ws-typed", name: "TypedRepo", path: wsPath, description: null });
    const result = await callRecentWorkspaces() as Array<Record<string, unknown>>;
    expect(result[0]).toMatchObject({ id: "ws-typed", name: "TypedRepo", path: wsPath });
    expect(typeof result[0]["hasSdd"]).toBe("boolean");
  });
});

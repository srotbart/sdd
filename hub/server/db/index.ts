import Database from "better-sqlite3";
import { MIGRATIONS } from "./schema.js";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) {
    return _db;
  }
  const dbPath = process.env["SDD_DB_PATH"] ?? "./sdd-hub.db";
  _db = new Database(dbPath);
  _db.exec("PRAGMA journal_mode = WAL");
  _db.exec("PRAGMA foreign_keys = ON");
  for (const migration of MIGRATIONS) {
    _db.exec(migration);
  }
  return _db;
}

export interface Workspace {
  id: string;
  name: string;
  path: string;
  description: string | null;
  created_at: string;
}

export interface Agent {
  id: string;
  workspace_id: string;
  pid: number;
  host: string;
  status: "idle" | "busy";
  last_heartbeat: string;
  created_at: string;
  name: string;
  initials: string;
}

export function computeInitials(name: string): string {
  return name
    .trim()
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function insertWorkspace(workspace: Omit<Workspace, "created_at">): void {
  getDb().prepare(
    `INSERT INTO workspaces (id, name, path, description) VALUES (?, ?, ?, ?)`
  ).run(workspace.id, workspace.name, workspace.path, workspace.description ?? null);
}

export function getAllWorkspaces(): Workspace[] {
  return getDb().prepare(
    `SELECT * FROM workspaces ORDER BY created_at ASC`
  ).all() as Workspace[];
}

export function getRecentWorkspaces(limit: number): Workspace[] {
  return getDb().prepare(
    `SELECT * FROM workspaces ORDER BY created_at DESC, rowid DESC LIMIT ?`
  ).all(limit) as Workspace[];
}

export function getWorkspaceById(id: string): Workspace | undefined {
  return getDb().prepare(
    `SELECT * FROM workspaces WHERE id = ?`
  ).get(id) as Workspace | undefined;
}

export function updateWorkspace(
  id: string,
  fields: Partial<Pick<Workspace, "name" | "path" | "description">>
): void {
  const sets = Object.keys(fields)
    .map((k) => `${k} = ?`)
    .join(", ");
  const values = [...Object.values(fields), id];
  getDb().prepare(`UPDATE workspaces SET ${sets} WHERE id = ?`).run(...values);
}

export function upsertAgent(agent: Omit<Agent, "created_at" | "last_heartbeat" | "initials">): void {
  getDb().prepare(
    `INSERT INTO agents (id, workspace_id, pid, host, status, name)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       pid = excluded.pid,
       host = excluded.host,
       status = excluded.status,
       name = excluded.name,
       last_heartbeat = datetime('now')`
  ).run(agent.id, agent.workspace_id, agent.pid, agent.host, agent.status, agent.name);
}

export function updateAgentHeartbeat(id: string): void {
  getDb().prepare(
    `UPDATE agents SET last_heartbeat = datetime('now') WHERE id = ?`
  ).run(id);
}

export function updateAgentStatus(id: string, status: "idle" | "busy"): void {
  getDb().prepare(
    `UPDATE agents SET status = ?, last_heartbeat = datetime('now') WHERE id = ?`
  ).run(status, id);
}

export function deleteAgent(id: string): void {
  getDb().prepare(`DELETE FROM agents WHERE id = ?`).run(id);
}

export function getAllAgents(): Agent[] {
  const rows = getDb().prepare(
    `SELECT * FROM agents ORDER BY created_at ASC`
  ).all() as Omit<Agent, "initials">[];
  return rows.map((row) => {
    const name = row.name || `${row.pid}@${row.host}`;
    return { ...row, name, initials: computeInitials(name) };
  });
}

export function getAgentIdsByWorkspace(): Map<string, string[]> {
  const rows = getDb().prepare(
    `SELECT id, workspace_id FROM agents`
  ).all() as { id: string; workspace_id: string }[];
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const list = map.get(row.workspace_id) ?? [];
    list.push(row.id);
    map.set(row.workspace_id, list);
  }
  return map;
}

export function closeDb(): void {
  _db?.close();
  _db = null;
}

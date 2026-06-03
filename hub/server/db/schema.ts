export const CREATE_WORKSPACES = `
  CREATE TABLE IF NOT EXISTS workspaces (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    path        TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

export const CREATE_AGENTS = `
  CREATE TABLE IF NOT EXISTS agents (
    id             TEXT PRIMARY KEY,
    workspace_id   TEXT NOT NULL REFERENCES workspaces(id),
    pid            INTEGER NOT NULL,
    host           TEXT NOT NULL,
    status         TEXT NOT NULL CHECK(status IN ('idle', 'busy')) DEFAULT 'idle',
    last_heartbeat TEXT NOT NULL DEFAULT (datetime('now')),
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    name           TEXT NOT NULL DEFAULT ''
  )
`;

export const MIGRATIONS = [CREATE_WORKSPACES, CREATE_AGENTS] as const;

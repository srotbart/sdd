---
id: WI-arch-003
gap-id: GAP-arch-003
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Set up SQLite database with better-sqlite3

**Scope:** `server/db/` — create database module, schema migrations, and workspace registry table using better-sqlite3

**Acceptance criteria:**
- `better-sqlite3` installed and typed (`@types/better-sqlite3`)
- Schema migration runs on startup and creates at minimum a `workspaces` table
- Database file written to a configurable local path (not hardcoded)
- Test: inserting and retrieving a workspace row via the db module round-trips correctly

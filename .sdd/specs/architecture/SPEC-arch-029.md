---
id: SPEC-arch-029
domain: architecture
abbrev: arch
status: active
aliases: []
version: "4c5c89cc"
---

# SPEC-arch-029 — Agents table includes a name column; getAllAgents returns name and initials

The SQLite agents table gains a `name TEXT NOT NULL` column. `getAllAgents()` returns `{ id, workspace_id, pid, host, status, last_heartbeat, name, initials }` where `initials` is computed from `name` at read time. Existing agent rows without a name are backfilled with the derived `pid@host` value on first access.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-029: agents table name column and getAllAgents name/initials > SPEC-arch-029: agents schema declares a NOT NULL name column — "the agents table schema includes a NOT NULL name column"
hub/server/spec-arch.test.ts > SPEC-arch-029: agents table name column and getAllAgents name/initials > SPEC-arch-029: getAllAgents returns name and computed initials — "getAllAgents returns both name and computed initials"
hub/server/spec-arch.test.ts > SPEC-arch-029: agents table name column and getAllAgents name/initials > SPEC-arch-029: empty-name agent row is backfilled with pid@host at read time — "an empty-name agent row is backfilled with pid@host at read time"

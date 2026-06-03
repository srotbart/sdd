---
id: SPEC-arch-029
domain: architecture
abbrev: arch
status: active
aliases: []
version: "0fb22505"
---

# SPEC-arch-029 — Agents table includes a name column; getAllAgents returns name and initials

The SQLite agents table gains a `name TEXT NOT NULL` column. `getAllAgents()` returns `{ id, workspace_id, pid, host, status, last_heartbeat, name, initials }` where `initials` is computed from `name` at read time. Existing agent rows without a name are backfilled with the derived `pid@host` value on first access.

---
id: SPEC-arch-003
domain: architecture
abbrev: arch
status: active
aliases: []
version: "88b7b87c"
---

# SPEC-arch-003 — Persistence is SQLite via better-sqlite3

All persistent state (workspace registry, agent connections, settings) is stored in a local SQLite database accessed via the better-sqlite3 driver. No other database engine is used.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-003: persistence is SQLite via better-sqlite3 > SPEC-arch-003: getDb returns a driver that executes SQLite SQL and persists rows — "round-trips a row through real SQLite SQL via the better-sqlite3 driver"
hub/server/spec-arch.test.ts > SPEC-arch-003: schema migrations > SPEC-arch-003: MIGRATIONS create workspaces and agents tables — "schema migrations create the SQLite workspaces and agents tables"

---
id: SPEC-arch-003
domain: architecture
abbrev: arch
status: active
aliases: []
version: "b2683aa1"
---

# SPEC-arch-003 — Persistence is SQLite via better-sqlite3

All persistent state (workspace registry, agent connections, settings) is stored in a local SQLite database accessed via the better-sqlite3 driver. No other database engine is used.

---
id: GAP-arch-015
spec-item: SPEC-arch-003
domain: architecture
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "f7296545"
closed-by: WI-arch-012
deferred-reason: null
---

# Gap: SQLite driver is node:sqlite, not better-sqlite3

**Location:** hub/server/db/index.ts:2

**Reasoning:** `DatabaseSync` is imported from `node:sqlite` (Node 22 built-in, experimental) — `better-sqlite3` is not installed or referenced anywhere in the project; spec requires the `better-sqlite3` driver specifically.

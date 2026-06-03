---
id: GAP-arch-025
spec-item: SPEC-arch-029
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "6165d585"
closed-by: WI-arch-023
deferred-reason: null
---

# Gap: Agents table has no name column; getAllAgents does not return name or initials

**Locations:**
- `hub/server/db/schema.ts:11-23`
- `hub/server/db/index.ts:95-99`

**Reasoning:** The `CREATE_AGENTS` DDL has no `name TEXT NOT NULL` column and `getAllAgents()` returns raw `SELECT *` with no initials computation, violating SPEC-arch-029.

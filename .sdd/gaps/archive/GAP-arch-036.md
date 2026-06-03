---
id: GAP-arch-036
spec-item: SPEC-arch-029
domain: architecture
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "5aca4dd3"
closed-by: WI-arch-033
deferred-reason: null
---

# Gap: getAllAgents does not backfill empty-name rows with pid@host

**Location:** `hub/server/db/index.ts:113`

**Reasoning:** `getAllAgents()` maps rows with `computeInitials(row.name)` but never detects or replaces the schema default `name = ''` with the derived `pid@host` string as specified; rows created without a name field will have empty name and empty initials.

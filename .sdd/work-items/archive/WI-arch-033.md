---
id: WI-arch-033
gap-id: GAP-arch-036
domain: architecture
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Backfill empty agent names with pid@host in getAllAgents

**Scope:** `hub/server/db/index.ts:113` — in `getAllAgents()`, detect rows where `name` is empty string and replace with derived `${row.pid}@${row.host}` before computing initials.

**Acceptance criteria:**
- `getAllAgents()` never returns a row with `name === ''` — empty names are replaced with `pid@host` at read time
- `initials` computed from the derived name is non-empty for rows that had no stored name
- Unit test: a row inserted without a name (empty string default) is returned with name `pid@host` and correct initials
- Unit test: a row inserted with an explicit name is returned unchanged

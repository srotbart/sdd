---
id: GAP-arch-024
spec-item: SPEC-arch-028
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "6165d585"
closed-by: WI-arch-023
deferred-reason: null
---

# Gap: Agent register message schema has no name field; server never stores or derives a name

**Locations:**
- `hub/server/ws-agent.ts:9-14`
- `hub/server/ws-agent.ts:62-74`

**Reasoning:** `RegisterMessage` type lacks a `name` field and the upsert call never sets a name; SPEC-arch-028 requires an optional `name` field stored on the agent record with server-side initials derivation.

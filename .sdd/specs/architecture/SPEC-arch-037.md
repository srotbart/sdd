---
id: SPEC-arch-037
domain: architecture
abbrev: arch
status: active
aliases: []
version: "060f8110"
---

# SPEC-arch-037 — Server WorkspaceCounts includes all 12 fields matching the client type

The server-side `WorkspaceCounts` object computed in `getWorkspacesEnriched()` must include all 12 fields defined in the client `WorkspaceCounts` type: `targetsAwaitingUser`, `targetsAwaitingAgent`, `targetsReady`, `targetsDraft`, `specs`, `specItems`, `openGaps`, `staleAuditDomains`, `workPending`, `workInProgress`, `workBlocked`, `workDoneToday`. Counts are computed from the workspace's `.sdd/` files at request time. Any field that cannot be computed returns 0, not `undefined`.

**Tests:**
hub/server/spec-arch-http.test.ts > SPEC-arch-010/030/037: GET /workspaces > SPEC-arch-037: counts object includes all 12 fields, each a number (0 not undefined) — "the workspace counts object exposes all 12 numeric fields"

---
id: SPEC-arch-037
domain: architecture
abbrev: arch
status: active
aliases: []
version: "f1efc6e7"
---

# SPEC-arch-037 — Server WorkspaceCounts includes all 12 fields matching the client type

The server-side `WorkspaceCounts` object computed in `getWorkspacesEnriched()` must include all 12 fields defined in the client `WorkspaceCounts` type: `targetsAwaitingUser`, `targetsAwaitingAgent`, `targetsReady`, `targetsDraft`, `specs`, `specItems`, `openGaps`, `staleAuditDomains`, `workPending`, `workInProgress`, `workBlocked`, `workDoneToday`. Counts are computed from the workspace's `.sdd/` files at request time. Any field that cannot be computed returns 0, not `undefined`.

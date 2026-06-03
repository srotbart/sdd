---
id: GAP-arch-032
spec-item: SPEC-arch-037
domain: architecture
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "50f69669"
closed-by: WI-arch-029
deferred-reason: null
---

# Gap: Server WorkspaceCounts has only 4 of the required 12 fields

**Location:** `hub/server/index.ts:81`

**Reasoning:** The server-side `WorkspaceCounts` interface declares only `targetsAwaitingUser`, `openGaps`, `workInProgress`, and `workBlocked`; it is missing `targetsAwaitingAgent`, `targetsReady`, `targetsDraft`, `specs`, `specItems`, `staleAuditDomains`, `workPending`, and `workDoneToday` that the client type requires.

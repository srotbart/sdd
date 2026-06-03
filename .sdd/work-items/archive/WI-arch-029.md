---
id: WI-arch-029
gap-id: [GAP-arch-031, GAP-arch-032]
domain: architecture
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Extend WorkspaceCounts to 12 fields and wire getWorkspacesEnriched into WebSocket messages

**Scope:** `hub/server/index.ts` and `hub/server/ws-ui.ts` — expand the server-side `WorkspaceCounts` interface to all 12 fields matching the client type, update `getWorkspacesEnriched()` to compute each field, export the function, and replace `getAllWorkspaces()` calls in `buildSnapshot()` and `broadcastUpdate()` with `getWorkspacesEnriched()`.

**Acceptance criteria:**
- `WorkspaceCounts` interface in `index.ts` includes all 12 fields: `targetsAwaitingUser`, `targetsAwaitingAgent`, `targetsReady`, `targetsDraft`, `specs`, `specItems`, `openGaps`, `staleAuditDomains`, `workPending`, `workInProgress`, `workBlocked`, `workDoneToday`
- Each field is computed from the workspace's `.sdd/` files at request time; fields that cannot be computed return 0
- `getWorkspacesEnriched()` is exported from `index.ts` (or moved to a shared module) so `ws-ui.ts` can import it
- `buildSnapshot()` calls `getWorkspacesEnriched()` instead of `getAllWorkspaces()`
- `broadcastUpdate()` calls `getWorkspacesEnriched()` instead of `getAllWorkspaces()`
- Server tests: `GET /workspaces` response includes all 12 count fields
- Server tests: WebSocket `snapshot` message payload includes enriched `WorkspaceData[]` with all 12 count fields

---
id: GAP-arch-031
spec-item: SPEC-arch-036
domain: architecture
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "50f69669"
closed-by: WI-arch-029
deferred-reason: null
---

# Gap: WebSocket snapshot and update messages send bare workspace rows instead of enriched WorkspaceData

**Locations:**
- `hub/server/ws-ui.ts:33` — `buildSnapshot()` calls `getAllWorkspaces()` instead of `getWorkspacesEnriched()`
- `hub/server/ws-ui.ts:48` — `broadcastUpdate()` calls `getAllWorkspaces()` instead of `getWorkspacesEnriched()`

**Reasoning:** Both functions use `getAllWorkspaces()` which returns bare `Workspace[]` rows without `counts`, `agents`, or `lastActivity`, violating the requirement that WebSocket messages carry the full `WorkspaceData[]` shape.

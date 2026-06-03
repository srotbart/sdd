---
id: WI-scr-025
gap-id: GAP-scr-025
domain: ui-screens
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Wire Dashboard to live WorkspaceData instead of MOCK_WORKSPACES

**Scope:** `hub/client/src/App.tsx` — replace `MOCK_WORKSPACES` passed to `<Dashboard>` with the live `workspaces` state (already fetched from GET /workspaces); cast/map the `DbWorkspace[]` to `WorkspaceData[]` shape using the enriched response fields (`counts`, `agents`, `lastActivity`); delete `MOCK_WORKSPACES`

**Acceptance criteria:**
- `MOCK_WORKSPACES` constant is deleted from App.tsx
- `<Dashboard>` receives the live workspace list from state
- Dashboard summary strip totals reflect real workspace counts
- Unit test: snapshot WebSocket message with workspaces updates Dashboard workspace count

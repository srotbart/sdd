---
id: WI-scr-039
gap-id: GAP-scr-038
status: done
created: "2026-06-01T00:00:00Z"
abandoned-reason: null
---

# Implement Projections screen in Hub client

**Scope:** `hub/client/src/screens/` — create `Projections.tsx` and wire it into `App.tsx` and `Sidenav.tsx` between the Specs and Gaps nav items

**Acceptance criteria:**
- `Projections.tsx` exists and renders a two-pane layout: left panel lists projections sorted by last modified, right panel renders selected projection body via `react-markdown`
- Left panel rows show subject name and relative timestamp (e.g. "2m ago")
- Projections nav item appears in the sidenav between Specs and Gaps
- `App.tsx` fetches `GET /workspaces/:id/projections` when a workspace becomes active and re-fetches on `sdd-changed` WebSocket events
- Selecting a projection fetches `GET /workspaces/:id/projections/:name` and renders the markdown in the right pane
- Test: renders the projections nav item in the sidenav
- Test: left panel lists projection rows from fetched data
- Test: right panel renders markdown content of selected projection

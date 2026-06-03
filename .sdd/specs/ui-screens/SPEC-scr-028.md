---
id: SPEC-scr-028
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "c3a095e7"
---

# SPEC-scr-028 — Dashboard receives live WorkspaceData from GET /workspaces

`App.tsx` fetches `GET /workspaces` on mount and on `update` WebSocket messages, and passes the resulting `WorkspaceData[]` to `<Dashboard>`. The `WorkspaceData` shape (SPEC-arch-030) includes live counts, agent IDs, and last-activity timestamp. `MOCK_WORKSPACES` is removed. The Dashboard's 5-column summary strip and workspace tiles reflect live data.

**Tests:**
- `hub/client/src/App.test.tsx > App targets data wiring > auto-selects the first workspace and fetches its targets when no localStorage key is set` — "App fetches workspace data from GET /workspaces on mount"
- `hub/client/src/App.test.tsx > sdd-changed WebSocket message triggers re-fetch (WI-arch-018) > re-fetches /specs when sdd-changed artifact is 'specs'` — "App re-fetches workspace data on sdd-changed WebSocket events"

---
id: SPEC-scr-001
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "72f1e0b4"
---

# SPEC-scr-001 — Hub Dashboard screen

`client/src/screens/Dashboard.tsx` renders a cross-workspace overview with: a 5-column summary strip (awaiting your input, open targets, open gaps, active work, stale audits — large serif numerals over uppercase eyebrow labels); an auto-fill workspace tile grid where each tile shows a live/idle dot, workspace name and path, attached agent chips, last-activity timestamp, and a 4-stat strip; and a unified agent-activity stream showing the last 10 lines across all workspaces.

**Tests:**
- `hub/client/src/App.test.tsx > Dashboard receives live WorkspaceData (WI-scr-025) > snapshot WebSocket message with workspaces populates Dashboard with live workspace count` — "Dashboard renders after receiving workspace list via WebSocket snapshot"
- `hub/client/src/App.test.tsx > Dashboard receives live WorkspaceData (WI-scr-025) > Dashboard receives workspaces from state — no workspace-tile rendered when workspaces is empty` — "Dashboard shows no tiles when workspace list is empty"

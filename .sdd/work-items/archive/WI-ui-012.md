---
id: WI-ui-012
gap-id: GAP-ui-012
domain: ui-layout
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Show empty-state prompt in main content when workspaces is empty

**Scope:** `hub/client/src/App.tsx:419-432` — in `renderMain()`, when `workspaces.length === 0` and `!activeWorkspace`, return a centred empty-state `<div>` reading "No workspace attached — use the sidenav to attach a project folder." instead of `<Dashboard>`

**Acceptance criteria:**
- When `workspaces` is empty, main content shows the empty-state prompt, not the Dashboard tile grid
- When `workspaces` has items and no workspace is active, main content shows the Dashboard
- Unit test: rendering App with empty workspaces list shows the empty-state message
- Unit test: rendering App with workspaces but no active workspace shows the Dashboard tile grid

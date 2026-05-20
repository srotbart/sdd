---
id: WI-scr-019
gap-id: GAP-scr-019
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

**Scope:** `hub/client/src/App.tsx` — call `history.replaceState` to update `?w=`, `?v=`, and `&id=` query params whenever the active workspace, active tab, or selected item changes; hub dashboard (no workspace) omits `?w=`; `plugin-reference` maps to `v=plugin-reference`; `&id=` is omitted when no item is selected; sidenav tab switches and item selections do not push new history entries.

**Acceptance criteria:**
- Selecting a workspace updates URL to `?w=<id>&v=<currentTab>`
- Switching tabs updates `?v=` in place without adding a browser history entry
- Selecting an item within a tab appends `&id=<itemId>` without a new history entry
- Deselecting an item removes `&id=` from the URL
- Navigating to hub dashboard (no workspace) results in a URL with no `?w=` param
- Unit test: `handleSelectWorkspace` triggers `history.replaceState` with correct params
- Unit test: tab switch calls `replaceState` with updated `?v=` and retains `?w=`
- Unit test: item deselection removes `&id=` from URL params

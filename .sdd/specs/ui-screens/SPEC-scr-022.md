---
id: SPEC-scr-022
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "0d464ffd"
---

# SPEC-scr-022 — Selected workspace is persisted in localStorage

The active workspace ID is written to `localStorage` under the key `hub.activeWorkspaceId` whenever the user switches workspaces. On mount, `App.tsx` reads this key and pre-selects the matching workspace if it is present in the fetched list. If the persisted ID is absent or no longer matches any workspace, the app falls back to the first workspace in the list.

**Tests:**
- `hub/client/src/App.test.tsx > localStorage workspace persistence (WI-scr-017) > writes hub.activeWorkspaceId to localStorage when a workspace is selected` — "Active workspace ID is written to localStorage on selection"
- `hub/client/src/App.test.tsx > localStorage workspace persistence (WI-scr-017) > pre-selects the persisted workspace on mount when the ID is present in the fetched list` — "App pre-selects the persisted workspace on mount"

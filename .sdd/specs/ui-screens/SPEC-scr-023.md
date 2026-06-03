---
id: SPEC-scr-023
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "5e25d2ad"
---

# SPEC-scr-023 — URL reflects navigation state; refresh restores the same view

The URL encodes active navigation state via query-string params: `?w=<workspaceId>` (absent when Hub dashboard is active), `&v=<tab>` (one of `session`, `targets`, `specs`, `gaps`, `work-items`, `settings`, `plugin-reference`), and `&id=<itemId>` (the selected item within the tab; omitted when none). On mount, URL params are read first and take precedence over `localStorage`. On navigation, `history.replaceState` updates the URL in place; sidenav tab switches and item selections do not push new history entries. If the URL-encoded workspace is missing from the list, the app falls back to `localStorage` then the first workspace. An unrecognised `v` param defaults to `targets`; an unrecognised `id` opens the tab with no item selected.

**Tests:**
- `hub/client/src/App.test.tsx > URL param replaceState on navigation (WI-scr-019) > selecting a workspace updates URL to ?w=<id>&v=session` — "Selecting a workspace encodes w= and v= in the URL"
- `hub/client/src/App.test.tsx > URL param replaceState on navigation (WI-scr-019) > switching tabs calls replaceState with updated ?v= and retains ?w=` — "Tab switches update v= while preserving w= in the URL"
- `hub/client/src/App.test.tsx > URL param mount initialisation (WI-scr-018) > initialises workspace and tab from URL params, ignoring localStorage` — "On mount, URL params take precedence over localStorage"

---
id: SPEC-scr-030
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "67af9eee"
---

# SPEC-scr-030 — CommandPalette onNavigate calls setSelectedItemId with the item ID

The `onNavigate` callback passed to `<CommandPalette>` calls both `setActiveTab(tab)` and `setSelectedItemId(id)` when the user selects an item. The item ID must not be discarded. After navigation, the target tab is active and the specific artifact is selected in the list pane, consistent with SPEC-scr-023 URL state encoding.

**Tests:**
- `hub/client/src/App.test.tsx > CommandPalette onNavigate sets selectedItemId (WI-scr-027) > onNavigate with a gap kind and ID navigates to gaps tab and closes palette` — "CommandPalette onNavigate calls setActiveTab and setSelectedItemId without discarding the ID"

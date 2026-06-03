---
id: WI-scr-027
gap-id: GAP-scr-027
domain: ui-screens
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Fix CommandPalette onNavigate to call setSelectedItemId with the item ID

**Scope:** `hub/client/src/App.tsx:525-534` — change the `onNavigate` callback so it calls both `setActiveTab(tab)` and `setSelectedItemId(id)` (renaming `_id` to `id`); also call `setPaletteOpen(false)` after navigating

**Acceptance criteria:**
- `onNavigate` receives `id` (not `_id`) and calls `setSelectedItemId(id)`
- After navigation the palette is closed
- The selected artifact is pre-selected in the target tab
- Unit test: invoking onNavigate with a gap ID and kind 'gap' sets activeTab to 'gaps' and selectedItemId to the gap ID

---
id: GAP-scr-027
spec-item: SPEC-scr-030
domain: ui-screens
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "b97bcf38"
closed-by: WI-scr-027
deferred-reason: null
---

# Gap: CommandPalette onNavigate discards the item ID — setSelectedItemId is never called

**Location:** `hub/client/src/App.tsx:525-534`

**Reasoning:** The `onNavigate` callback receives `(kind, _id)` but only calls `setActiveTab(tab)`, discarding `_id`; SPEC-scr-030 requires also calling `setSelectedItemId(id)` so the selected artifact is pre-selected in the target tab.

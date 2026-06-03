---
id: GAP-scr-001
spec-item: SPEC-scr-038
domain: ui-screens
status: closed
discovered: "2026-06-01T00:00:00Z"
audit-spec-version: "3e4fd6e3"
closed-by: WI-scr-035
deferred-reason: null
---

# Gap: Kanban does not fill full width of its containing panel

**Location:** `hub/client/src/screens/WorkItems.css:22`

**Reasoning:** `.kanban` has `align-self: start` which collapses the grid to content width along the cross axis of its flex-column parent `.wi-main`, preventing it from stretching to fill the full panel width as required by SPEC-scr-038.

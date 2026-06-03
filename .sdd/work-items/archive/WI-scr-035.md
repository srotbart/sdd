---
id: WI-scr-035
gap-id: GAP-scr-001
domain: ui-screens
status: done
created: "2026-06-01T00:00:00Z"
abandoned-reason: null
---

# WI-scr-035 — Remove align-self: start from .kanban so it fills full panel width

**Scope:** `hub/client/src/screens/WorkItems.css:22` — remove `align-self: start` from the `.kanban` rule so the grid stretches to fill the full width of its flex-column parent `.wi-main`

**Acceptance criteria:**
- The `.kanban` CSS rule does not contain `align-self: start`
- Test: `.kanban` element fills the full width of `.wi-main` when rendered (no `align-self` or `align-self: stretch`)
- Test: all four `.kanban-col` elements remain equal width (`grid-template-columns: repeat(4, 1fr)` still present)
- Test: an empty column has the same width as a populated column

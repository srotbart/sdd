---
id: SPEC-scr-006
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "0542197e"
---

# SPEC-scr-006 — Workspace Work Items screen

`client/src/screens/WorkItems.tsx` is a Kanban with four equal-width columns (pending, in progress, blocked, done·today) sharing one outer hairline border. Each card shows ID in mono accent, serif title, agent chip or "unassigned", and a gap-ID footer link. In-progress cards show a dashed-top italic progress note; blocked cards show a clay-red blockedReason. Clicking a card opens a ~460 px right side drawer with full detail, acceptance-criteria checklist, progress note, closing-gap card, and action buttons.

**Tests:**
- `hub/client/src/screens/WorkItems.test.tsx > WorkItems — done column 24h filter > done item closed 1h ago appears in kanban done column` — "Done item closed within 24h appears in the done·today kanban column"
- `hub/client/src/screens/WorkItems.test.tsx > WorkItems — done column 24h filter > done item closed 25h ago does not appear in kanban done column` — "Done item closed more than 24h ago does not appear in the done column"

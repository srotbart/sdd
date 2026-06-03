---
id: SPEC-scr-021
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "2c56c3e4"
---

# SPEC-scr-021 — WorkItems screen fetches live data, splits done-today, and adds ArchiveFooter

`App.tsx` fetches `GET /workspaces/:id/work-items` when the active workspace ID changes and passes the result to the `WorkItems` component, replacing mock data. The "done · today" kanban column shows only items closed within the last 24 hours. Items with `status: done` closed more than 24 hours ago, plus all `status: abandoned` items, are excluded from the kanban and shown only in the `ArchiveFooter`. The `ArchiveFooter` is a collapsible horizontal strip pinned below the kanban columns. Collapsed: shows `▸ archive`, total archived count, and "last closed N ago". Expanded: scrollable area grouped by day (Today / Yesterday / weekday date), with a search input, status filter (all / done / abandoned), and domain filter. Each archived card shows ID, status pill, title, agent chip or "unassigned", gap ID. Clicking opens the item in the right-side drawer. All filters reset on collapse.

**Tests:**
- `hub/client/src/App.test.tsx > App gaps and work-items data wiring (WI-scr-016) > fetches /workspaces/:id/work-items after selecting a workspace` — "App fetches work items from the backend when a workspace is selected"
- `hub/client/src/screens/WorkItems.test.tsx > WorkItems — done column 24h filter > done item closed 25h ago appears in ArchiveFooter` — "Items done more than 24h ago appear in the ArchiveFooter"
- `hub/client/src/screens/WorkItems.test.tsx > WorkItems — abandoned items > abandoned item appears in ArchiveFooter` — "Abandoned items appear in the ArchiveFooter, not the kanban"

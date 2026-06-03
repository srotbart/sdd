---
id: SPEC-scr-038
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "3e4fd6e3"
---

# SPEC-scr-038 — Kanban columns fill full board width equally regardless of item count

## Invariant

The work items kanban board always fills the full width of its containing panel. The four status columns (`pending`, `in progress`, `blocked`, `done · today`) divide the board into equal quarters regardless of how many work items each column contains. A column with no items is the same width as a fully populated column.

## Acceptance criteria

- The `.kanban` element fills the full width of its flex parent (`.wi-main`) regardless of content
- Each of the four `.kanban-col` elements is equal in width to every other column
- An empty column (header + empty-state placeholder only) has identical width to a column containing items
- All four columns maintain equal width when every column is simultaneously empty

---
id: SPEC-scr-039
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "0dc973d5"
---

# SPEC-scr-039 — Spec item list renders body as markdown, capped at 5 lines

## Invariant

In `SpecItemList`, each item's body is rendered via `react-markdown` rather than as plain text. The rendered output is capped to a maximum of 5 visible lines using CSS `line-clamp`; content beyond 5 lines is clipped without a disclosure affordance. Clicking the row navigates to the full detail view where the complete body is visible.

## Acceptance criteria

- Each `.specs-item__body` in the list renders markdown (e.g. `**bold**` produces `<strong>`, backtick code produces `<code>`)
- The body container has `-webkit-line-clamp: 5` and `overflow: hidden` so content beyond 5 lines is not visible
- No "read more" or expand control is rendered in the list row
- Clicking the row still opens the full detail view with the untruncated body

**Tests:**
- `hub/client/src/screens/Specs.test.tsx > Specs screen item list markdown body and line-clamp (SPEC-scr-039) > renders markdown in the list row — **bold** becomes <strong>` — "list-row body renders item markdown via react-markdown rather than plain text"
- `hub/client/src/screens/Specs.test.tsx > Specs screen item list markdown body and line-clamp (SPEC-scr-039) > .specs-item__body has -webkit-line-clamp: 5` — "list-row body is capped to five visible lines via CSS line-clamp"
- `hub/client/src/screens/Specs.test.tsx > Specs screen item list markdown body and line-clamp (SPEC-scr-039) > .specs-item__body has overflow: hidden` — "content beyond the clamp is clipped with overflow hidden, no disclosure affordance"
- `hub/client/src/screens/Specs.test.tsx > Specs screen item detail view (SPEC-scr-037) > clicking an item replaces the list with the detail view showing that item title` — "clicking a list row opens the full detail view of that item"

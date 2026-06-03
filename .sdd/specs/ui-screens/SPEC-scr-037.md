---
id: SPEC-scr-037
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "04330b56"
---

# SPEC-scr-037 — Specs screen item detail view replaces the item list with a back button and markdown-rendered body

Clicking a spec item in the Specs screen replaces the item list with a dedicated detail view. The detail view contains: a `← items` back button that restores the filtered item list; the item header (mono-accent ID, `StatusPill`, open-gap pill if applicable, `TestStatusDot`); the item title in Newsreader serif; the item body rendered via `react-markdown` wrapped in `.spec-item-detail__body` for prose styling; and gap/WI ref pills at the bottom. The domain sidebar remains visible at all times. State: `selectedItemId: string | null` added to `Specs.tsx` (null = list, non-null = detail). Implementation split into `SpecItemList.tsx`, `SpecItemDetail.tsx`, and `useSpecSearch.ts`.

**Tests:**
- `hub/client/src/screens/Specs.test.tsx > Specs screen item detail view (SPEC-scr-037) > clicking an item replaces the list with the detail view showing that item title` — "Clicking a spec item replaces the item list with the detail view"
- `hub/client/src/screens/Specs.test.tsx > Specs screen item detail view (SPEC-scr-037) > clicking the back button restores the item list` — "Back button in detail view restores the filtered item list"
- `hub/client/src/screens/SpecItemDetail.test.tsx > SpecItemDetail (SPEC-scr-037) > renders the item body as markdown — **bold** becomes <strong>` — "Item body is rendered via react-markdown, not as plain text"

---
id: SPEC-scr-036
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "c29091e7"
---

# SPEC-scr-036 — Specs screen has a fuzzy search input that filters items within the selected domain

A text input above the spec item list filters items within the currently selected domain in real time using `fuse.js` (`threshold: 0.4`, keys: `id` and `title` only). An empty query returns all items in their original order. Switching domains resets the query to `""`. Navigating to the item detail view and pressing back preserves the query.

**Tests:**
- `hub/client/src/screens/Specs.test.tsx > Specs screen fuzzy search (SPEC-scr-036) > typing a query that matches one item leaves only that item in the list` — "Fuzzy search filters the item list to matching results in real time"
- `hub/client/src/screens/Specs.test.tsx > Specs screen fuzzy search (SPEC-scr-036) > clearing the query restores all items` — "Clearing the search query restores all items"
- `hub/client/src/screens/Specs.test.tsx > Specs screen fuzzy search (SPEC-scr-036) > switching domains clears the search input` — "Switching domains resets the search query to empty"
- `hub/client/src/screens/useSpecSearch.test.ts > useSpecSearch — non-empty query > matches on title field` — "useSpecSearch matches items by id and title fields via fuse.js"

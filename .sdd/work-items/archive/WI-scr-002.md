---
id: WI-scr-002
gap-id: GAP-scr-001
domain: ui-screens
status: done
created: "2026-05-29T00:00:00Z"
abandoned-reason: null
---

# Work Item: Wire fuzzy search input into Specs screen

**Scope:** `hub/client/src/screens/Specs.tsx` — add a text `<input>` above the spec item list, connect it to `useSpecSearch`, reset query to `""` on domain switch, and preserve query when navigating to detail view and back.

**Acceptance criteria:**
- A search input renders above the item list in the Specs right pane
- Typing filters items in real time via `useSpecSearch`
- Switching domains resets the query to `""`
- An empty query returns all items in their original order
- Query is preserved when entering and leaving item detail view
- Integration test: typing a query that matches one item leaves only that item in the list
- Integration test: switching domains clears the search input

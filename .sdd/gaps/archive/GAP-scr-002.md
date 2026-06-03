---
id: GAP-scr-002
spec-item: SPEC-scr-037
domain: ui-screens
status: closed
discovered: "2026-05-29T00:00:00Z"
audit-spec-version: "43004038"
closed-by: WI-scr-004
deferred-reason: null
---

# Gap: Specs screen has no item detail view with back button and markdown rendering

**Locations:**
- `hub/client/src/screens/Specs.tsx:1`
- `hub/client/package.json:1`

**Reasoning:** `Specs.tsx` has no `selectedItemId` state, no `← items` back button, no `SpecItemList`/`SpecItemDetail`/`useSpecSearch` split, and `react-markdown` is absent from `package.json` — spec requires clicking an item to replace the list with a detail view that renders the item body via `react-markdown`.

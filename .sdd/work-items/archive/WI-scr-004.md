---
id: WI-scr-004
gap-id: GAP-scr-002
domain: ui-screens
status: done
created: "2026-05-29T00:00:00Z"
abandoned-reason: null
---

# Work Item: Wire selectedItemId state and back button into Specs.tsx

**Scope:** `hub/client/src/screens/Specs.tsx` — add `selectedItemId: string | null` state (null = list, non-null = detail); render `<SpecItemList>` when null and `<SpecItemDetail>` when non-null; back button sets state to null; clicking an item in the list sets state to that item's ID; `initialSpecId` prop pre-selects on mount.

**Acceptance criteria:**
- Clicking a spec item in the list replaces the item list with `SpecItemDetail`
- The `← items` back button in the detail view restores the item list
- `initialSpecId` prop causes the detail view to open pre-selected on mount
- The domain sidebar remains visible in both list and detail views
- URL state encoding (SPEC-scr-023) is preserved: `?id=` param reflects the selected item
- Integration test: clicking an item navigates to detail view showing that item's title
- Integration test: clicking `← items` back button restores the item list

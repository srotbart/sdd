---
id: GAP-uic-017
spec-item: SPEC-uic-013
domain: ui-components
status: closed
discovered: "2026-06-05T13:45:00Z"
audit-spec-version: "93e58648"
closed-by: WI-uic-020
deferred-reason: null
---

# Gap: No shared Markdown component with remark-gfm; all screens import react-markdown directly

**Locations:**
- `hub/client/src/screens/SpecItemDetail.tsx:1`
- `hub/client/src/screens/SpecItemList.tsx:1`
- `hub/client/src/screens/Targets.tsx:2`
- `hub/client/src/screens/Designs.tsx:2`
- `hub/client/src/screens/Projections.tsx:2`

**Reasoning:** No shared `Markdown` component exists and none of the five screen files use `remark-gfm`, so GFM tables, strikethrough, and task lists do not render correctly.

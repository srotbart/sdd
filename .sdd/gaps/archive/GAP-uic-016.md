---
id: GAP-uic-016
spec-item: SPEC-uic-012
domain: ui-components
status: closed
discovered: "2026-06-05T11:05:00Z"
audit-spec-version: "18ca936d"
closed-by: WI-uic-019
deferred-reason: null
---

# Gap: ArtifactIdLink component does not exist; artifact IDs in rows are plain text

**Locations:**
- `hub/client/src/screens/Targets.tsx`
- `hub/client/src/screens/Gaps.tsx`
- `hub/client/src/screens/WorkItems.tsx`
- `hub/client/src/screens/Issues.tsx`
- `hub/client/src/screens/Improvements.tsx`
- `hub/client/src/screens/SpecItemDetail.tsx`

**Reasoning:** No `ArtifactIdLink` component exists; artifact IDs rendered in rows, meta lines, and reference pills across all screens are plain text `<span>` elements rather than clickable links that open the `ArtifactPeeker`.

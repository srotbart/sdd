---
id: GAP-uic-009
spec-item: SPEC-uic-009
domain: ui-components
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "e48bbe04"
closed-by: WI-uic-012
deferred-reason: null
---

# Gap: ArtifactList does not own the filtering pipeline — filterKey, archivedValues, filterLabels props are absent

**Location:** `hub/client/src/components/ArtifactList.tsx:4`

**Reasoning:** `ArtifactListProps` only has `items`, `archivedItems`, `renderRow`, and `getKey`; the `filterKey`, `archivedValues`, and `filterLabels` props that would give `ArtifactList` control of tab derivation, per-tab counts, and internal `activeFilter` state are not declared or implemented.

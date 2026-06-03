---
id: GAP-uic-014
spec-item: SPEC-uic-010
domain: ui-components
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "d5e3dee4"
closed-by: WI-uic-017
deferred-reason: null
---

# Gap: ArtifactList tab derivation does not filter out empty-string values

**Location:** `hub/client/src/components/ArtifactList.tsx:29`

**Reasoning:** `allValues` is built from `items.map(...).Set()` with no `.filter(v => v \!== '')`, so an item whose `filterKey` field is an empty string produces an unlabeled tab button, contrary to SPEC-uic-010 which requires empty-string values to be excluded from the tab list.

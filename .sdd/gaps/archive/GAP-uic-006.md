---
id: GAP-uic-006
spec-item: SPEC-uic-005
domain: ui-components
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "e48bbe04"
closed-by: WI-uic-009
deferred-reason: null
---

# Gap: StatusPill STATUS_MAP is missing entries for 'deferred' and 'abandoned'

**Location:** `hub/client/src/components/StatusPill.tsx:9`

**Reasoning:** `STATUS_MAP` covers 13 status values but omits `'deferred'` and `'abandoned'`, which are now part of the `ArtifactStatus` union (SPEC-arch-040); gaps with `status: 'deferred'` and work items with `status: 'abandoned'` fall through to the `?? ['draft', status]` default instead of having a canonical label and color.

---
id: GAP-uic-005
spec-item: SPEC-uic-005
domain: ui-components
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "0226ee52"
closed-by: WI-uic-008
deferred-reason: null
---

# Gap: StatusPill STATUS_MAP missing 'archived' status added to ArtifactStatus union

**Location:** `hub/client/src/components/StatusPill.tsx:9-22`

**Reasoning:** `STATUS_MAP` covers 13 statuses but not `'archived'`, which was added to `ArtifactStatus` (SPEC-scr-032/WI-scr-029); SPEC-uic-005 requires `STATUS_MAP` to cover all values in the union, and any `'archived'` status pill will fall through to the `'draft'` default.

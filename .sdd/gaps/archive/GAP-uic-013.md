---
id: GAP-uic-013
spec-item: SPEC-uic-005
domain: ui-components
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "d5e3dee4"
closed-by: WI-uic-016
deferred-reason: null
---

# Gap: WorkItems.tsx defines STATUS_BORDER — an independent ArtifactStatus-to-color mapping

**Location:** `hub/client/src/screens/WorkItems.tsx:24`

**Reasoning:** `STATUS_BORDER` maps `pending`, `in-progress`, `blocked`, and `done` (all members of `ArtifactStatus`) to CSS color values outside of `StatusPill`; SPEC-uic-005 prohibits any component from defining its own status-to-color mapping for `ArtifactStatus` values.

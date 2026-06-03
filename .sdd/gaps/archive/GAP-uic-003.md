---
id: GAP-uic-003
spec-item: SPEC-uic-003
domain: ui-components
status: closed
discovered: "2026-05-19T00:00:00Z"
audit-spec-version: "55087b57"
closed-by: WI-uic-006
deferred-reason: null
---

# Gap: TestStatusDot component does not exist

**Location:** `hub/client/src/components/TestStatusDot.tsx`

**Reasoning:** The file does not exist; no `TestStatusDot` component is defined or rendered anywhere in the client, so test status is never shown on spec item lines as required by SPEC-uic-003.

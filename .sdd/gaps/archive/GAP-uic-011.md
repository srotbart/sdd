---
id: GAP-uic-011
spec-item: SPEC-uic-003
domain: ui-components
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "d5e3dee4"
closed-by: WI-uic-014
deferred-reason: null
---

# Gap: TestStatusDot timestamp is not always-visible — hidden when lastRun is absent

**Location:** `hub/client/src/components/TestStatusDot.tsx:28`

**Reasoning:** `showTime = status \!== 'not-run' && lastRun` suppresses the timestamp entirely when `lastRun` is undefined; the spec requires an "always-visible dimmed timestamp string" (omitted only for `not-run` status), meaning any non-`not-run` item without a `lastRun` value silently shows nothing instead of a placeholder.

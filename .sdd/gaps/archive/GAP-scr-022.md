---
id: GAP-scr-022
spec-item: SPEC-scr-020
domain: ui-screens
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "c0711a8c"
closed-by: WI-scr-022
deferred-reason: null
---

# Gap: Gaps screen archived section omits deferred and accepted statuses

**Location:** `hub/client/src/screens/Gaps.tsx:27`

**Reasoning:** `archivedGaps` is filtered by `status === 'closed'` only; `deferred` and `accepted` gaps are neither shown in the active section nor the archived section, making them invisible in the UI despite being valid terminal states that should appear in the archived section.

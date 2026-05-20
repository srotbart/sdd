---
id: GAP-scr-021
spec-item: SPEC-scr-018
domain: ui-screens
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "c0711a8c"
closed-by: WI-scr-021
deferred-reason: null
---

# Gap: Sidenav specs count uses mock data instead of live specs

**Location:** `hub/client/src/App.tsx:424`

**Reasoning:** `tabCounts.specs` is set to `MOCK_SPECS.length` (a hardcoded value of 1) instead of `liveSpecs.length`, so the sidenav specs badge does not reflect the actual number of spec domains fetched from the backend.

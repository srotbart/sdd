---
id: GAP-scr-026
spec-item: SPEC-scr-029
domain: ui-screens
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "b97bcf38"
closed-by: WI-scr-026
deferred-reason: null
---

# Gap: Activity screen receives MOCK_ACTIVITY; no liveActivity state accumulates WebSocket events

**Locations:**
- `hub/client/src/App.tsx:459`
- `hub/client/src/App.tsx:477`

**Reasoning:** No `liveActivity` state exists in App.tsx; the `activity` WebSocket message handler returns without updating state; both Dashboard and Activity screen receive the static `MOCK_ACTIVITY` array, violating SPEC-scr-029's requirement to accumulate real events capped at 500.

---
id: WI-scr-026
gap-id: GAP-scr-026
domain: ui-screens
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Add liveActivity state accumulated from WebSocket activity events

**Scope:** `hub/client/src/App.tsx` — (1) add `liveActivity: ActivityLine[]` state capped at 500 entries; (2) in the WS `onmessage` handler for `type === 'activity'`, map the message to an `ActivityLine` and prepend to `liveActivity`, dropping entries beyond 500; (3) pass `liveActivity` to both `<Dashboard activity={...}>` and `<Activity lines={...}>` replacing `MOCK_ACTIVITY`; (4) delete `MOCK_ACTIVITY`

**Acceptance criteria:**
- `MOCK_ACTIVITY` constant is deleted from App.tsx
- `liveActivity` state exists and is initialised to `[]`
- Activity WebSocket messages are prepended to `liveActivity`
- `liveActivity` is capped at 500 entries (tail dropped beyond 500)
- `<Dashboard>` and `<Activity>` receive `liveActivity`
- Unit test: activity WS message appends an ActivityLine to liveActivity state
- Unit test: liveActivity is capped at 500 when more than 500 events arrive

---
id: SPEC-scr-029
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "ecd54189"
---

# SPEC-scr-029 — Activity screen accumulates live activity events from WebSocket

`App.tsx` maintains a `liveActivity: ActivityLine[]` state capped at 500 entries. Each `activity` WebSocket message (SPEC-arch-025) is prepended to the list; entries beyond 500 are dropped from the tail. `<Activity>` receives `liveActivity` and `liveAgents` instead of `MOCK_ACTIVITY` and `MOCK_AGENTS`. The Activity screen's "live log stream" (SPEC-scr-007) is thereby populated with real agent events.

**Tests:**
- `hub/client/src/App.test.tsx > liveActivity accumulated from WebSocket activity events (WI-scr-026) > activity WS message appears in Activity screen after navigating to activity tab` — "Activity WebSocket messages appear in the Activity screen"
- `hub/client/src/screens/Activity.test.tsx > Activity screen — no simulation code (SPEC-scr-034) > renders only the provided lines and no synthetic extras` — "Activity screen renders only real lines passed via props"

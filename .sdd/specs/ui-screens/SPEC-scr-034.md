---
id: SPEC-scr-034
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "7b7cf56a"
---

# SPEC-scr-034 — Activity screen renders only real agent events; all simulation code removed

`Activity.tsx` must not contain any hardcoded activity data, simulation timers, or generated fake events. `LIVE_EXTRAS`, `tickCount` state, and any `setInterval` that generates synthetic activity lines are deleted. The `allLines` variable (or equivalent) equals the `lines` prop directly. An empty activity log when no agents have emitted events is the correct and expected state.

**Tests:**
- `hub/client/src/screens/Activity.test.tsx > Activity screen — no simulation code (SPEC-scr-034) > renders empty activity log when lines prop is empty — no fake entries appear` — "Activity renders empty log with no synthetic entries when lines prop is empty"
- `hub/client/src/screens/Activity.test.tsx > Activity screen — no simulation code (SPEC-scr-034) > filters lines by selected agent without mixing in fake entries` — "Agent filter applies to real lines only"

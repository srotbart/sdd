---
id: SPEC-scr-007
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "91e51f45"
---

# SPEC-scr-007 — Workspace Activity screen

`client/src/screens/Activity.tsx` renders a live log stream with a live/paused toggle and active-agent count in the toolbar. An agent filter row (all + one button per agent) sits above a 3-column line grid (timestamp 78 px mono, agent name 100 px mono, message). Messages support inline highlights and file-reference spans. When live, a "listening…" placeholder line appears at the tail. The `AgentsView` component from the prototype is not ported.

**Tests:**
- `hub/client/src/screens/Activity.test.tsx > Activity screen — no simulation code (SPEC-scr-034) > renders empty activity log when lines prop is empty — no fake entries appear` — "Activity renders empty log with no synthetic entries"
- `hub/client/src/screens/Activity.test.tsx > Activity screen — no simulation code (SPEC-scr-034) > renders only the provided lines and no synthetic extras` — "Activity renders only real agent-emitted lines"

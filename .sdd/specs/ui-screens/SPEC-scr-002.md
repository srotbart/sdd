---
id: SPEC-scr-002
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "dfb4d51f"
---

# SPEC-scr-002 — Workspace Session screen

`client/src/screens/Session.tsx` mirrors the `/sdd:session-start` output: a terminal-style invocation block with timestamp; a 5-column pipeline strip (targets / spec items / open gaps / work items / done today) with the active stage marked by a 2 px accent top border; priority-ordered category sections (targets awaiting user, targets awaiting agent, ready targets, draft targets, specs, stale audit warning, open gaps, active work items); and a footer next-action terminal block.

**Tests:**
- `hub/client/src/screens/Session.test.tsx > Session screen (SPEC-scr-002) > renders a 5-column pipeline strip` — "Session renders the pipeline strip with 5 stage cells"
- `hub/client/src/screens/Session.test.tsx > Session screen (SPEC-scr-002) > renders the next-action footer block` — "Session renders the footer next-action terminal block"
- `hub/client/src/screens/Session.test.tsx > Session screen (SPEC-scr-002) > renders targets awaiting user when present` — "Session surfaces awaiting-user targets in the priority section"

---
id: SPEC-ui-010
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "ee761b7a"
---

# SPEC-ui-010 — Sidenav alert badge shows awaiting-user target count per workspace

`App.tsx` computes `alertCount` for each workspace as the number of `liveTargets` with `status === 'awaiting-user'` belonging to that workspace. The computed value is passed as `alertCount` in the workspace array to `<Sidenav>`. The badge renders when `alertCount > 0` and is absent otherwise. SPEC-ui-002's "alert badge for items awaiting user attention" is satisfied by this count.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-010 — sidenav alert badge from awaiting-user targets > SPEC-ui-010: badge shows the count of awaiting-user targets for the active workspace` — "Alert badge reflects the number of awaiting-user live targets for the active workspace."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-010 — sidenav alert badge from awaiting-user targets > SPEC-ui-010: badge is absent when no targets are awaiting-user` — "No alert badge renders when no targets await the user."

---
id: SPEC-ui-010
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "e0feafab"
---

# SPEC-ui-010 — Sidenav alert badge shows awaiting-user target count per workspace

`App.tsx` computes `alertCount` for each workspace as the number of `liveTargets` with `status === 'awaiting-user'` belonging to that workspace. The computed value is passed as `alertCount` in the workspace array to `<Sidenav>`. The badge renders when `alertCount > 0` and is absent otherwise. SPEC-ui-002's "alert badge for items awaiting user attention" is satisfied by this count.

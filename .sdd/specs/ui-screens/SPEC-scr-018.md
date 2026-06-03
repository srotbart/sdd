---
id: SPEC-scr-018
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "7ddc8260"
---

# SPEC-scr-018 — Sidenav item counts reflect non-archived items only

The count badge next to each sidenav navigation item (Targets, Specs, Gaps, Work Items) shows only items whose status is not terminal/archived: targets exclude `accepted` and `archived`; gaps exclude `closed` and `deferred`; work items exclude `done` and `abandoned`. Counts update reactively as workspace data changes. Specs show the number of spec domains (all active — specs are never archived).

**Tests:**
- `hub/client/src/App.test.tsx > Sidenav tabCounts computed from live data (WI-scr-009) > sidenav targets count badge shows only non-accepted targets` — "Targets badge excludes accepted/archived targets"
- `hub/client/src/App.test.tsx > App gaps and work-items data wiring (WI-scr-016) > sidenav gaps count uses live gaps data excluding closed and deferred` — "Gaps badge excludes closed and deferred gaps"
- `hub/client/src/App.test.tsx > App gaps and work-items data wiring (WI-scr-016) > sidenav work items count uses live work-items data excluding done and abandoned` — "Work items badge excludes done and abandoned items"

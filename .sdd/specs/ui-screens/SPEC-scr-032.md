---
id: SPEC-scr-032
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "29fda051"
---

# SPEC-scr-032 — TargetStatus includes 'archived'; parser and sidenav count updated accordingly

The `TargetStatus` union type is extended to include `'archived'`. `parseTargets` sets `status: 'archived'` for targets read from the archive directory (SPEC-arch-035). The sidenav target count (SPEC-scr-018) filters out both `'accepted'` and `'archived'` statuses. The Targets screen filter tab labeled "archived" (SPEC-scr-003) renders rows where `status === 'archived'`.

**Tests:**
- `hub/client/src/screens/Targets.test.tsx > TargetStatus 'archived' routes to archived section (WI-scr-029) > target with status archived appears in the archived section, not the active list` — "Targets with status 'archived' appear in the archived section"
- `hub/client/src/App.test.tsx > Sidenav tabCounts computed from live data (WI-scr-009) > sidenav targets count badge shows only non-accepted targets` — "Sidenav count excludes both 'accepted' and 'archived' targets"

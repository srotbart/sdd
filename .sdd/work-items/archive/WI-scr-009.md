---
id: WI-scr-009
gap-id: GAP-scr-009
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Compute and pass sidenav tabCounts from live data

**Scope:** `hub/client/src/App.tsx` — replace `tabCounts={}` with a computed object derived from live state: targets count excludes `accepted` and `archived` statuses; gaps count excludes `closed` and `deferred`; work items count excludes `done` and `abandoned`; specs count is number of spec domains. Pass the computed object to `<Sidenav tabCounts={...}>`.

**Acceptance criteria:**
- `tabCounts` is computed (not hardcoded `{}`) from `liveTargets`, gaps, and work items state
- Targets count excludes `accepted` and `archived` statuses
- Gaps count excludes `closed` and `deferred` statuses
- Work items count excludes `done` and `abandoned` statuses
- Specs count equals number of spec domains (all active)
- Counts update reactively when workspace data changes (re-render on state change)
- Test: mock targets with mixed statuses and assert `tabCounts.targets` equals non-terminal count
- Test: sidenav badge for targets reflects the computed count

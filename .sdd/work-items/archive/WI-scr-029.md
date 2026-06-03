---
id: WI-scr-029
gap-id: GAP-scr-029
domain: ui-screens
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Add 'archived' to TargetStatus and fix Targets.tsx archive split

**Scope:** `hub/client/src/types.ts` and `hub/client/src/screens/Targets.tsx` — (1) add `'archived'` to the `TargetStatus` union in types.ts; (2) in Targets.tsx change `archivedTargets` filter from `status === 'accepted'` to `status === 'archived'`; (3) update sidenav count filter in App.tsx to exclude both `'accepted'` and `'archived'`

**Acceptance criteria:**
- `TargetStatus` union includes `'archived'`
- `archivedTargets` in Targets.tsx filters on `status === 'archived'`
- Sidenav target count excludes both `'accepted'` and `'archived'` targets
- Targets with `status: 'archived'` appear in the archived section of the list
- Unit test: target with status 'archived' is routed to the archived section, not the active list

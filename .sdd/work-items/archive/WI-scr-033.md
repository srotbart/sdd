---
id: WI-scr-033
gap-id: GAP-scr-033
domain: ui-screens
status: done
created: "2026-05-21T00:00:00Z"
abandoned-reason: null
---

# Work Item: Migrate Targets.tsx and Gaps.tsx to ArtifactList filterKey/archivedValues API

**Scope:** `hub/client/src/screens/Targets.tsx` and `hub/client/src/screens/Gaps.tsx` — remove inline filter state and filter bar JSX; pass all items unfiltered to ArtifactList with `filterKey`, `archivedValues`, and `filterLabels` props

**Acceptance criteria:**
- `Targets.tsx`: `filter` useState, `activeTargets`/`archivedTargets` variables, and inline `.targets-filter-bar` JSX are removed; ArtifactList receives all targets with `filterKey="status"`, `archivedValues={['accepted','archived']}`, and human-readable `filterLabels`
- `Gaps.tsx`: `filterDomain` useState and inline `.gaps-filter-bar` JSX are removed; ArtifactList receives all gaps with `filterKey="domain"`, `archivedValues={['closed','deferred']}`
- All existing filter tabs still render correctly (ArtifactList owns them)
- Existing Targets and Gaps screen tests pass; no regressions in archived-row rendering or selection behaviour

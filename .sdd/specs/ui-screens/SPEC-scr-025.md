---
id: SPEC-scr-025
domain: ui-screens
abbrev: ui-screens
status: active
aliases: [SPEC-scr-026, SPEC-scr-036]
version: "838dfcf9"
---

# SPEC-scr-025 — Targets and Gaps screens use ArtifactList with filterKey/archivedValues API; inline filter logic removed

`Targets.tsx` and `Gaps.tsx` render active and archived rows via the shared `ArtifactList` component (`hub/client/src/components/ArtifactList.tsx`, SPEC-uic-001) with no inline reimplementation. `Targets.tsx` passes all targets (unfiltered) with `filterKey="status"`, `archivedValues={['accepted','archived']}`, and `filterLabels` for human-readable tab names. `Gaps.tsx` passes all gaps with `filterKey="domain"`, `archivedKey="status"`, `archivedValues={['closed','deferred','accepted']}`. No inline filter state, manual active/archived split, or filter bar JSX is permitted in either screen; those responsibilities belong exclusively to `ArtifactList`.

**Tests:**
- `hub/client/src/screens/Targets.test.tsx > Targets uses ArtifactList filterKey API — no inline filter state (WI-scr-033) > renders artifact-list-filter-bar instead of targets-filter-bar` — "Targets uses ArtifactList's filter bar, not a bespoke one"
- `hub/client/src/screens/Targets.test.tsx > Targets list uses ArtifactList for all filter tabs (WI-scr-023) > awaiting-you filter renders only awaiting-user rows via ArtifactList` — "ArtifactList filter tabs work correctly in Targets"
- `hub/client/src/screens/Gaps.test.tsx > Gaps uses ArtifactList filterKey/archivedKey API — no inline domain filter bar (WI-scr-033) > renders artifact-list-filter-bar for domain filtering — no gaps-filter-bar` — "Gaps uses ArtifactList's filter bar, not inline domain filter JSX"

---
id: GAP-scr-033
spec-item: SPEC-scr-036
domain: ui-screens
status: closed
discovered: "2026-05-21T00:00:00Z"
audit-spec-version: "6f46ec1b"
closed-by: WI-scr-033
deferred-reason: null
---

# Gap: Targets.tsx and Gaps.tsx retain inline filter logic instead of using ArtifactList filterKey/archivedValues API

**Locations:**
- `hub/client/src/screens/Targets.tsx:246-315`
- `hub/client/src/screens/Gaps.tsx:19-51`

**Reasoning:** Both components still own inline filter state (`filter`/`filterDomain` useState), manually split active/archived items, render their own filter bar JSX, and pass pre-filtered arrays to ArtifactList — none pass `filterKey` or `archivedValues` props; SPEC-scr-036 requires ArtifactList to own all of this logic.

---
id: GAP-uic-001
spec-item: SPEC-uic-001
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "d059c530"
closed-by: WI-uic-003
deferred-reason: null
---

# GAP-uic-001 — ArtifactList shared component does not exist

**Locations:**
- `hub/client/src/components/ArtifactList.tsx` — file does not exist
- `hub/client/src/components/ArtifactList.css` — file does not exist
- `hub/client/src/screens/Targets.tsx:321` — inline archived divider block instead of ArtifactList
- `hub/client/src/screens/Gaps.tsx:50` — flat list with no archived/active split; no ArtifactList usage

**Reasoning:** `ArtifactList.tsx` and `ArtifactList.css` are entirely absent; `Targets.tsx` renders the archived divider inline; `Gaps.tsx` has no archived section at all — neither screen uses the shared component.

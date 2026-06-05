---
id: GAP-uic-015
spec-item: SPEC-uic-011
domain: ui-components
status: closed
discovered: "2026-06-05T11:05:00Z"
audit-spec-version: "96739a93"
closed-by: WI-uic-018
deferred-reason: null
---

# Gap: ArtifactPeeker component does not exist

**Location:** `hub/client/src/components/`
**Reasoning:** No `ArtifactPeeker` component exists anywhere in the codebase; the spec requires a reusable right-side slide-over that accepts an artifact id + type, reuses per-type detail views, is dismissible (close button, Esc, click-outside), provides a "go to artifact" control, and is opened via shared/app-level state.

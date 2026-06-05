---
id: SPEC-uic-011
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "02af1f56"
---

# SPEC-uic-011 — ArtifactPeeker: a reusable right-side artifact viewer

## Invariant

A reusable component named **`ArtifactPeeker`** renders a panel that slides/expands on top from the right edge to show an artifact's content, given the artifact's id and type. It supports all artifact types (`TGT-*`, `SPEC-*`, `GAP-*`, `WI-*`, `ISS-*`, `IMP-*`), reusing the per-type detail view where one already exists and a generic rendering otherwise. It is dismissible (close button, `Esc`, and click-outside) and provides a control to navigate directly to the artifact's dedicated screen/detail. A single app-level instance is opened via shared state so any caller anywhere in the UI can peek any artifact.

## Acceptance criteria

- An `ArtifactPeeker` component renders a right-side slide-over showing an artifact's content by id + type
- It supports all artifact types, reusing existing per-type detail views where available and a generic render otherwise
- It is dismissible via a close button, `Esc`, and click-outside
- It provides a "go to artifact" control that navigates to the artifact's dedicated screen/detail
- It is exposed via shared/app-level state so any component can open it (a single reused instance)

**Tests:**
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — open and show content > peeker becomes visible after openPeeker is called`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — TGT type renders target content > renders target title when kind is TGT`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — close button dismisses peeker > clicking the close button removes the peeker overlay`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — Esc key dismisses peeker > pressing Esc closes the peeker`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — click-outside (overlay backdrop) dismisses peeker > clicking the overlay backdrop closes the peeker`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — go to artifact control navigates > clicking go-to-artifact button calls onNav with correct tab and id for TGT`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — per-type rendering without crash > renders SPEC type without crashing`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — per-type rendering without crash > renders GAP type without crashing and shows gap title`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — per-type rendering without crash > renders WI type without crashing and shows work item title`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — per-type rendering without crash > renders ISS type without crashing and shows issue title`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — per-type rendering without crash > renders IMP type without crashing and shows improvement title`
- `hub/client/src/components/ArtifactPeeker.test.tsx::SPEC-uic-011 ArtifactPeeker — single app-level instance via context > PeekerContext provides openPeeker and closePeeker`

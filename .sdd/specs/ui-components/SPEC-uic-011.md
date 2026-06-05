---
id: SPEC-uic-011
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "96739a93"
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

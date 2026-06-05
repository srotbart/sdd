---
id: SPEC-uic-012
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "18ca936d"
---

# SPEC-uic-012 — Artifact IDs render as links that open the ArtifactPeeker

## Invariant

Artifact IDs shown in the Hub UI are rendered as clickable links via a shared link component (built on `ArtifactPeeker`, SPEC-uic-011) that opens the referenced artifact in the peeker. IDs that appear as titles/headings or other UI chrome are excluded and remain plain text. The behavior is consistent across screens (rows, meta lines, reference pills, etc.) and works for all artifact types' IDs.

## Acceptance criteria

- Artifact IDs in rows, meta lines, and reference pills render as clickable links
- Clicking an artifact-ID link opens that artifact in the `ArtifactPeeker`
- IDs used as titles/headings or other chrome are not linkified (remain plain text)
- A single shared link component is used so the behavior is consistent across screens
- Linkification works for all artifact-type IDs (`TGT-`/`SPEC-`/`GAP-`/`WI-`/`ISS-`/`IMP-`)

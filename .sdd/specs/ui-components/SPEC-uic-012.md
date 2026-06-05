---
id: SPEC-uic-012
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "89bb0757"
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

**Tests:**
- `hub/client/src/components/ArtifactIdLink.test.tsx::SPEC-uic-012 ArtifactIdLink — renders as a button element (not plain span) > renders a button element for a TGT- prefixed id`
- `hub/client/src/components/ArtifactIdLink.test.tsx::SPEC-uic-012 ArtifactIdLink — clicking opens the ArtifactPeeker via context > clicking the link calls openPeeker with correct id and kind for TGT`
- `hub/client/src/components/ArtifactIdLink.test.tsx::SPEC-uic-012 ArtifactIdLink — clicking opens the ArtifactPeeker via context > clicking the link calls openPeeker with correct id and kind for GAP`
- `hub/client/src/components/ArtifactIdLink.test.tsx::SPEC-uic-012 ArtifactIdLink — works for all artifact-type ID prefixes > renders a button and opens peeker for TGT-001 (kind: TGT)`
- `hub/client/src/components/ArtifactIdLink.test.tsx::SPEC-uic-012 ArtifactIdLink — works for all artifact-type ID prefixes > renders a button and opens peeker for SPEC-uic-001 (kind: SPEC)`
- `hub/client/src/components/ArtifactIdLink.test.tsx::SPEC-uic-012 ArtifactIdLink — works for all artifact-type ID prefixes > renders a button and opens peeker for GAP-uic-003 (kind: GAP)`
- `hub/client/src/components/ArtifactIdLink.test.tsx::SPEC-uic-012 ArtifactIdLink — works for all artifact-type ID prefixes > renders a button and opens peeker for WI-uic-007 (kind: WI)`
- `hub/client/src/components/ArtifactIdLink.test.tsx::SPEC-uic-012 ArtifactIdLink — works for all artifact-type ID prefixes > renders a button and opens peeker for ISS-002 (kind: ISS)`
- `hub/client/src/components/ArtifactIdLink.test.tsx::SPEC-uic-012 ArtifactIdLink — works for all artifact-type ID prefixes > renders a button and opens peeker for IMP-004 (kind: IMP)`
- `hub/client/src/components/ArtifactIdLink.test.tsx::SPEC-uic-012 ArtifactIdLink — stopPropagation prevents parent click firing > click on ArtifactIdLink does not bubble to parent element`

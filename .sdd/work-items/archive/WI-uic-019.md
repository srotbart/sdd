---
id: WI-uic-019
gap-id: GAP-uic-016
domain: ui-components
status: done
created: "2026-06-05T11:06:00Z"
abandoned-reason: null
---

# Work Item: Implement ArtifactIdLink and wire across screens

**Scope:** `hub/client/src/components/ArtifactIdLink.tsx` + wire into `hub/client/src/screens/Targets.tsx`, `Gaps.tsx`, `WorkItems.tsx`, `Issues.tsx`, `Improvements.tsx`, `SpecItemDetail.tsx` — replace plain-text artifact ID spans in rows, meta lines, and reference pills with clickable `ArtifactIdLink`

**Acceptance criteria:**
- `ArtifactIdLink` component renders an artifact ID as a clickable link element (not a plain span)
- Clicking the link calls the peeker context to open the artifact in `ArtifactPeeker`
- Wired in `Targets.tsx`: target row `.target-row__id` span replaced with `ArtifactIdLink`
- Wired in `Gaps.tsx`: gap row `.gaps-row__id`, gap detail `.gap-detail__id`, and closer pill IDs replaced
- Wired in `WorkItems.tsx`: kanban card `.kcard__id` and drawer `.wi-drawer__id` replaced
- Wired in `Issues.tsx`: issue row `.issues-row__id` replaced
- Wired in `Improvements.tsx`: improvement row `.improvements-row__id` replaced
- Wired in `SpecItemDetail.tsx`: reference pills `.specs-ref-pill` IDs replaced
- IDs used as titles/headings (`h2`, `h3`) remain plain text — not linkified
- Unit test (SPEC-uic-012): ArtifactIdLink renders as a button/link element
- Unit test (SPEC-uic-012): clicking ArtifactIdLink calls the peeker open function
- Unit test (SPEC-uic-012): ArtifactIdLink works for all artifact-type ID prefixes

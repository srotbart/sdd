---
id: ISS-scr-001
domain: ui-screens
status: accepted
location: "hub/client/src/screens/Improvements.tsx:13"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: fix/client-dedup
---

# Issue: Improvements screen is a hand-maintained clone of Issues screen

**Location:** `hub/client/src/screens/Improvements.tsx:13` (clone of `Issues.tsx`)
**Problem:** `Improvements.tsx` is a structural clone of `Issues.tsx` — same layout, `ArtifactList` wiring, list-row, detail panel, and status-pill ternary — differing only in field labels and CSS class prefixes.
**Rationale:** Two whole screens kept in lockstep by hand means every list/detail layout fix has to be applied twice.
**Severity:** medium

## Dialog

### 2026-06-28 — Agent
Accepted as a **standards-violation refactor** (no gap, per SPEC-wf-028/029). Standards rule:
"structural-clone screens share a parametrised component" (Project-Specific Conventions).
Refactored in `fix/client-dedup`: Issues and Improvements now render a shared
`ReviewArtifactScreen`. Behavior preserved (client 556). Archived as accepted.

---
id: ISS-scr-001
domain: ui-screens
status: open
location: "hub/client/src/screens/Improvements.tsx:13"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: Improvements screen is a hand-maintained clone of Issues screen

**Location:** `hub/client/src/screens/Improvements.tsx:13` (clone of `Issues.tsx`)
**Problem:** `Improvements.tsx` is a structural clone of `Issues.tsx` — same layout, `ArtifactList` wiring, list-row, detail panel, and status-pill ternary — differing only in field labels and CSS class prefixes.
**Rationale:** Two whole screens kept in lockstep by hand means every list/detail layout fix has to be applied twice.
**Severity:** medium

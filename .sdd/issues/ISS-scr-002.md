---
id: ISS-scr-002
domain: ui-screens
status: open
location: "hub/client/src/screens/Issues.tsx:48"
severity: low
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: Ad-hoc date-trim formatting repeated across five files

**Location:** `hub/client/src/screens/Issues.tsx:48` (also Improvements, Gaps, Targets, ArtifactPeeker)
**Problem:** The ad-hoc `discovered.split('T')[0]` date formatting is repeated across five files.
**Rationale:** A scattered string-slice for date display means any change to date formatting requires hunting down every literal.
**Severity:** low

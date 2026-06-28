---
id: ISS-scr-002
domain: ui-screens
status: accepted
location: "hub/client/src/screens/Issues.tsx:48"
severity: low
discovered: "2026-06-27T21:55:29Z"
reviewed-by: fix/client-dedup
---

# Issue: Ad-hoc date-trim formatting repeated across five files

**Location:** `hub/client/src/screens/Issues.tsx:48` (also Improvements, Gaps, Targets, ArtifactPeeker)
**Problem:** The ad-hoc `discovered.split('T')[0]` date formatting is repeated across five files.
**Rationale:** A scattered string-slice for date display means any change to date formatting requires hunting down every literal.
**Severity:** low

## Dialog

### 2026-06-28 — Agent
Accepted as a **standards-violation refactor** (no gap, per SPEC-wf-028/029). Standards rule:
"don't repeat a non-trivial code shape across 3+ sites — extract a shared helper" (Best
Practices). Refactored in `fix/client-dedup`: the date-trim is now `dayOf` in util/date.ts,
used at all five sites. Behavior preserved (client 556). Archived as accepted.

---
id: ISS-arch-004
domain: architecture
status: accepted
location: "hub/server/sdd-parser.ts:269"
severity: high
discovered: "2026-06-27T21:55:29Z"
reviewed-by: fix/server-dedup
---

# Issue: Six near-identical artifact-list parsers duplicate the same scaffold

**Location:** `hub/server/sdd-parser.ts:269`
**Problem:** `parseGaps`, `parseWorkItems`, `parseIssues`, `parseImprovements` (and `parseTargets`) each repeat the same read-dir + filter prefix/`.md` + parse-each + read-archive-dir + parse-each scaffold, differing only in the prefix and the per-file parser.
**Rationale:** Five copies of the same directory-walking boilerplate means any change to listing or archive behaviour must be made in five places and risks drifting out of sync.
**Severity:** high

## Dialog

### 2026-06-28 — Agent
Accepted as a **standards-violation refactor** (no gap — standards are not spec items,
SPEC-wf-028/029). Standards rule: "one source per repeated mechanism" (Architectural Rules)
and "don't repeat a non-trivial code shape across 3+ sites" (Best Practices). Refactored in
`fix/server-dedup`: the five duplicated parser scaffolds collapsed into a shared
`collectArtifacts` helper. Behavior preserved (server suite 337). Archived as accepted.

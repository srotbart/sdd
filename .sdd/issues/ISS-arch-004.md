---
id: ISS-arch-004
domain: architecture
status: open
location: "hub/server/sdd-parser.ts:269"
severity: high
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: Six near-identical artifact-list parsers duplicate the same scaffold

**Location:** `hub/server/sdd-parser.ts:269`
**Problem:** `parseGaps`, `parseWorkItems`, `parseIssues`, `parseImprovements` (and `parseTargets`) each repeat the same read-dir + filter prefix/`.md` + parse-each + read-archive-dir + parse-each scaffold, differing only in the prefix and the per-file parser.
**Rationale:** Five copies of the same directory-walking boilerplate means any change to listing or archive behaviour must be made in five places and risks drifting out of sync.
**Severity:** high

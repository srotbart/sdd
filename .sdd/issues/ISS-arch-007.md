---
id: ISS-arch-007
domain: architecture
status: open
location: "hub/client/src/App.tsx:139"
severity: low
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: domainAbbrev derivation duplicated between server and client

**Location:** `hub/client/src/App.tsx:139` (and `hub/server/sdd-parser.ts:160`)
**Problem:** The `domain.split('-').map(p => p.slice(0,2)).join('').slice(0,6) || domain` abbreviation rule is duplicated verbatim in `mapApiTarget` and in `parseTargetFile`.
**Rationale:** Two independent copies of the same display-id rule can silently diverge, so the same target could show different abbreviations depending on the code path.
**Severity:** low

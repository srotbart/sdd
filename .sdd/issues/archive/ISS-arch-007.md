---
id: ISS-arch-007
domain: architecture
status: accepted
location: "hub/client/src/App.tsx:139"
severity: low
discovered: "2026-06-27T21:55:29Z"
reviewed-by: fix/client-dedup
---

# Issue: domainAbbrev derivation duplicated between server and client

**Location:** `hub/client/src/App.tsx:139` (and `hub/server/sdd-parser.ts:160`)
**Problem:** The `domain.split('-').map(p => p.slice(0,2)).join('').slice(0,6) || domain` abbreviation rule is duplicated verbatim in `mapApiTarget` and in `parseTargetFile`.
**Rationale:** Two independent copies of the same display-id rule can silently diverge, so the same target could show different abbreviations depending on the code path.
**Severity:** low

## Dialog

### 2026-06-28 — Agent
Accepted as a **standards-violation refactor** (no gap, per SPEC-wf-028/029). Standards rule:
"one definition for a cross-tier derivation rule" (Architectural Rules). Refactored in
`fix/client-dedup`: the domain-abbrev rule is now a named `deriveDomainAbbrev` on each tier
(App.tsx, sdd-parser.ts) with a cross-reference comment, no inline duplication. Behavior
preserved (client 556, server 337). Archived as accepted.

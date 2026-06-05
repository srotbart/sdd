---
id: SPEC-wf-023
domain: workflow
abbrev: wf
status: active
aliases: []
version: "449a3de9"
---

# SPEC-wf-023 — Each artifact type has one authoritative operating guide

## Invariant

Each SDD artifact type has exactly one authoritative source that fully defines how to work with it, located at `references/artifacts/{type}.md` (e.g. `target.md`, `spec.md`, `gap.md`, `work-item.md`). This guide is the single source of truth and contains all six sections: (1) schema / required frontmatter fields and ID convention, (2) lifecycle / state machine, (3) valid state transitions, (4) operating procedure, (5) invariants and discipline (e.g. append-only dialog, atomic writes, version recomputation, archiving on terminal state), and (6) edge cases. Skills and `references/schemas.md` reference these guides rather than restating the rules, so the rules cannot drift between sources. "Complete knowledge of how to work with an artifact" is defined as all six sections being present in that artifact's guide.

## Acceptance criteria

- Every SDD artifact type has a guide file at `references/artifacts/{type}.md`
- Each guide contains all six sections: schema/ID, lifecycle, transitions, procedure, invariants/discipline, edge cases
- `references/schemas.md` and the skills reference these guides instead of duplicating the rules
- A CI/grep check fails if any artifact guide is missing one of the six sections
- Each guide is the single source of truth for working with its artifact type (no competing copy)

**Tests:**
- `plugin/scripts/check-artifact-guides.js` — "exits 0 when all 4 guides have all 6 sections present"

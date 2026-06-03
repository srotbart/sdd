---
id: SPEC-wf-013
domain: workflow
abbrev: wf
status: active
aliases: []
version: "8328e6aa"
---

# SPEC-wf-013 — Spec items are stored as individual files in domain subdirectories

## Invariant

Each spec item lives at `.sdd/specs/{domain}/SPEC-{abbrev}-{NNN}.md`. Removed or obsolete items are moved to `.sdd/specs/{domain}/archive/SPEC-{abbrev}-{NNN}.md`. There is no flat domain-level spec file (e.g. `SPEC-workflow.md`) — the subdirectory is the domain's spec. Skills and tools that enumerate spec items glob `.sdd/specs/{domain}/SPEC-*.md`, skipping any `archive/` subdirectory. The domain name is derived from the subdirectory name.

## Acceptance criteria

- Each spec item is stored at `.sdd/specs/{domain}/SPEC-{abbrev}-{NNN}.md` (one file per item)
- No flat domain-level spec files (e.g. `SPEC-workflow.md`) exist under `.sdd/specs/`
- Obsolete items are moved to `.sdd/specs/{domain}/archive/`, not deleted in place
- All SDD skills enumerate spec items by globbing `SPEC-*.md` and skip the `archive/` subdirectory

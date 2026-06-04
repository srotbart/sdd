---
id: SPEC-wf-016
domain: workflow
abbrev: wf
status: active
aliases: []
version: "c2802861"
---

# SPEC-wf-016 — Flat domain spec files are decomposed into per-item files during migration

## Invariant

Existing flat `SPEC-{domain}.md` files are decomposed: each `## SPEC-{abbrev}-{NNN}` section becomes its own file at `.sdd/specs/{domain}/SPEC-{abbrev}-{NNN}.md` with per-item frontmatter synthesized from the section metadata and the domain file's header frontmatter. The flat domain files are deleted after all items are extracted. The `design/` subdirectory and non-domain files (e.g. `COLLAPSE-*.md`) in `.sdd/specs/` are left untouched.

## Acceptance criteria

- Each `## SPEC-{abbrev}-{NNN}` section from a flat file becomes its own `.sdd/specs/{domain}/SPEC-{abbrev}-{NNN}.md` with correct frontmatter
- Flat `SPEC-{domain}.md` files are deleted after all items are extracted
- `design/` subdirectory and `COLLAPSE-*.md` files in `.sdd/specs/` are not modified
- No flat domain spec files remain in `.sdd/specs/` after migration completes

**Tests:** skipped — historical one-time migration step — no migration code remains in-repo

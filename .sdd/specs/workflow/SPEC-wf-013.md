---
id: SPEC-wf-013
domain: workflow
abbrev: wf
status: active
aliases: []
version: "164ae0d0"
---

# SPEC-wf-013 — Spec items are stored as individual files in domain subdirectories

## Invariant

Each spec item lives at `.sdd/specs/{domain}/SPEC-{abbrev}-{NNN}.md`. Removed or obsolete items are moved to `.sdd/specs/{domain}/archive/SPEC-{abbrev}-{NNN}.md`. There is no flat domain-level spec file (e.g. `SPEC-workflow.md`) — the subdirectory is the domain's spec. Skills and tools that enumerate spec items glob `.sdd/specs/{domain}/SPEC-*.md`, skipping any `archive/` subdirectory. The domain name is derived from the subdirectory name.

## Acceptance criteria

- Each spec item is stored at `.sdd/specs/{domain}/SPEC-{abbrev}-{NNN}.md` (one file per item)
- No flat domain-level spec files (e.g. `SPEC-workflow.md`) exist under `.sdd/specs/`
- Obsolete items are moved to `.sdd/specs/{domain}/archive/`, not deleted in place
- All SDD skills enumerate spec items by globbing `SPEC-*.md` and skip the `archive/` subdirectory

**Tests:**

- `hub/server/spec-wf.test.ts > SPEC-wf-013: spec items stored as individual files in domain subdirectories > SPEC-wf-013: parses each per-item file under a domain subdirectory into one spec item` — each per-item file becomes one parsed spec item
- `hub/server/spec-wf.test.ts > SPEC-wf-013: spec items stored as individual files in domain subdirectories > SPEC-wf-013: skips items under an archive subdirectory rather than treating them as active` — archived items are excluded from active items
- `hub/server/spec-wf.test.ts > SPEC-wf-013: spec items stored as individual files in domain subdirectories > SPEC-wf-013: a flat domain-level file (no per-item frontmatter) yields no spec item` — a legacy flat domain file is not treated as a spec item

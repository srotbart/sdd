---
id: WI-arch-028
gap-id: GAP-arch-030
domain: architecture
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Set status 'archived' on targets read from archive directory in parseTargets

**Scope:** `hub/server/sdd-parser.ts:188-193` — after parsing each target from the archive directory, override its `status` field to `'archived'` before pushing to the results array

**Acceptance criteria:**
- Targets read from `.sdd/targets/archive/` have `status === 'archived'` regardless of frontmatter value
- Targets read from `.sdd/targets/` (active directory) retain their frontmatter status unchanged
- Unit test: target file in archive directory with frontmatter `status: ready` is returned with `status: 'archived'`
- Unit test: target file in active directory retains its frontmatter status

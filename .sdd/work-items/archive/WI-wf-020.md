---
id: WI-wf-020
gap-id: GAP-wf-021
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create per-artifact operating guides and CI section-check

**Scope:** `plugin/references/artifacts/` — create guide files for target, spec, gap, work-item (6 sections each); update `schemas.md` to be an index; add `plugin/scripts/check-artifact-guides.js` CI check

**Acceptance criteria:**
- `plugin/references/artifacts/target.md`, `spec.md`, `gap.md`, `work-item.md` exist with all 6 sections
- Each guide section: (1) Schema/ID, (2) Lifecycle, (3) Transitions, (4) Procedure, (5) Invariants/Discipline, (6) Edge Cases
- `plugin/references/schemas.md` updated to be an index linking each guide
- `plugin/scripts/check-artifact-guides.js` exits non-zero if any guide is missing a section
- Test: run `node plugin/scripts/check-artifact-guides.js` → exits 0 with all guides present
- Test: removing a section header from a guide file causes the check to exit non-zero

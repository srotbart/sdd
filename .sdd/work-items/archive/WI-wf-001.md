---
id: WI-wf-001
gap-id: GAP-wf-001
domain: workflow
status: done
created: "2026-06-01T17:18:22Z"
abandoned-reason: null
---

# Work Item: Add Invariant and Acceptance Criteria sections to workflow spec item files and schemas

**Scope:** `.sdd/specs/workflow/SPEC-wf-001.md` through `SPEC-wf-016.md` and `SPEC-wf-018.md` (17 files), `plugin/references/schemas.md:87` — add `## Invariant` and `## Acceptance criteria` sections to each existing spec item file; update schemas.md spec item template to document the required sections

**Acceptance criteria:**
- All 17 workflow spec item files (001–016, 018) contain `## Invariant` and `## Acceptance criteria` sections in the correct order after the title heading
- `plugin/references/schemas.md` spec item template shows `## Invariant` and `## Acceptance criteria` sections with descriptions of what each section should contain
- Test: grep for `## Invariant` across all `.sdd/specs/workflow/SPEC-wf-*.md` (excluding archive) returns exactly 18 matches
- Test: grep for `## Acceptance criteria` across all `.sdd/specs/workflow/SPEC-wf-*.md` (excluding archive) returns exactly 18 matches

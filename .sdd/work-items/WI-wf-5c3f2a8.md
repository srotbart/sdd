---
id: WI-wf-5c3f2a8
gap-id: GAP-wf-a3f8c21
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add ## Invariant and ## Acceptance criteria sections to SPEC-wf-017

**Scope:** `.sdd/specs/workflow/SPEC-wf-017.md` — restructure the body to add `## Invariant` (concise rule) and `## Acceptance criteria` (bullet list) sections, then recompute the version hash

**Acceptance criteria:**
- `## Invariant` section present in the file with a concise statement of the structural mandate
- `## Acceptance criteria` section present with a verifiable bullet list
- `**Tests:**` block preserved (or added) after `## Acceptance criteria`
- `version` field in frontmatter recomputed after the content change
- Test: spec-wf.test.ts or spec-wf-plugin.test.ts passes — the item correctly has both sections per SPEC-wf-017's own invariant

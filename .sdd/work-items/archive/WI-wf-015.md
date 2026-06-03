---
id: WI-wf-015
gap-id: GAP-wf-015
domain: workflow
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Split {sdd_work} statusline token into {sdd_pending}/{sdd_in_progress} format

**Scope:** `plugin/skills/install-statusline/SKILL.md:43` — replace the single `{sdd_work}` token in the statusline config template with `{sdd_pending}/{sdd_in_progress}` so the work segment renders as two separate counts separated by a slash, matching SPEC-wf-011.

**Acceptance criteria:**
- Statusline config template shows `work: {sdd_pending}/{sdd_in_progress}` not `work: {sdd_work}`
- The token description section defines both `{sdd_pending}` and `{sdd_in_progress}` separately
- The fallback count section derives each token independently (pending count, in-progress count)
- Test: grep confirms `{sdd_work}` does not appear in the statusline config template line
- Test: grep confirms `{sdd_pending}` and `{sdd_in_progress}` both appear in the SKILL.md

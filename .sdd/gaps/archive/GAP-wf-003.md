---
id: GAP-wf-003
spec-item: SPEC-wf-010
domain: workflow
status: closed
discovered: "2026-05-28T00:00:00Z"
audit-spec-version: "d4cdbe33"
closed-by: WI-wf-003
deferred-reason: null
---

# Gap: install-statusline uses wrong token names for current-dir and context tokens

**Locations:**
- `plugin/skills/install-statusline/SKILL.md:30`
- `plugin/skills/install-statusline/SKILL.md:35`

**Reasoning:** The skill config writes `{basename}` and `{context_bar}`/`{context_pct}` (underscores), but the spec mandates `{current-dir}` and `{context-bar}`/`{context-pct}` (dashes) as the canonical token names.

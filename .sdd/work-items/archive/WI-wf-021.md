---
id: WI-wf-021
gap-id: GAP-wf-022
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add operating contract emission to session-start

**Scope:** `plugin/skills/session-start/SKILL.md` — add a new step that reads `references/artifacts/*.md` guides and emits a terse consolidated operating contract

**Acceptance criteria:**
- session-start SKILL.md contains a step (numbered in procedure) that emits artifact operating contract
- The step instructs reading each guide from `references/artifacts/` and summarizing rules
- The contract covers all active artifact types (target, spec, gap, work-item)
- The step references the full guides for exhaustive detail
- Test: grep `plugin/skills/session-start/SKILL.md` for "operating contract" → found
- Test: grep confirms the step references `references/artifacts/` path

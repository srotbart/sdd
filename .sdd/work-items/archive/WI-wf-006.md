---
id: WI-wf-006
gap-id: GAP-wf-006
domain: workflow
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add gap-report and nothing-to-do instructions to sdd-worker prompt

**Scope:** `plugin/skills/spawn-sdd-worker/SKILL.md:43` — edit the worker prompt block to add: (1) after sdd:spec-audit completes, send a SendMessage to team lead listing every gap found before proceeding to sdd:gap-to-work-items; (2) if no gaps and no pending work items exist at any step, send a "nothing to do" message to team lead and stop

**Acceptance criteria:**
- The worker prompt instructs the worker to send a SendMessage to "team-lead" after sdd:spec-audit listing gap IDs and locations before proceeding
- The worker prompt instructs the worker to send a "nothing to do" message to "team-lead" and stop if no gaps are found and no work items exist
- The "nothing to do" case is checked before attempting sdd:gap-to-work-items (no gaps → report and stop, don't decompose)
- Skill text test: the SKILL.md worker prompt block contains "SendMessage" referencing team lead after the spec-audit step
- Skill text test: the SKILL.md worker prompt block contains a "nothing to do" or equivalent shutdown instruction

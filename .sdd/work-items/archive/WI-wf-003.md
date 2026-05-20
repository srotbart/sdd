---
id: WI-wf-003
gap-id: GAP-wf-003
domain: workflow
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add two-phase workflow description to sdd:init skill

**Scope:** `plugin/skills/sdd-init/SKILL.md` — add a section describing the two-phase SDD workflow: intent phase (human + Claude, via `/sdd:target-engage`) and execution phase (sdd-worker agent, via `/sdd:spawn-sdd-worker`), so new users understand the handoff model from the start.

**Acceptance criteria:**
- A new section in `sdd-init/SKILL.md` describes the intent phase and execution phase by name
- The section references `/sdd:spawn-sdd-worker` as the tool for delegating execution
- Placement is after the directory structure description and before the closing instructions
- Verification: grep confirms "sdd-worker" and "execution" both appear in the init skill source

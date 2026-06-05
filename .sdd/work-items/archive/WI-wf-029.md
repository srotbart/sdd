---
id: WI-wf-029
gap-id: GAP-wf-030
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create /sdd:next skill

**Scope:** `plugin/skills/next/SKILL.md` (new) — create the `/sdd:next` skill that surveys `.sdd/` state, ranks candidate next actions, and routes user selection to matching skills

**Acceptance criteria:**
- `plugin/skills/next/SKILL.md` exists
- SKILL.md specifies reusing session-start state-reading (not a separate copy)
- SKILL.md specifies presenting multiple candidate actions each with rationale, priority, recommendation, and size
- SKILL.md specifies size derived heuristically from artifact type and counts
- SKILL.md requires user interactive selection (not auto-applied)
- SKILL.md specifies routing to existing SDD skills (target-engage, spec-audit, gap-to-work-items, work-item-close, spec-test)
- Test: grep `plugin/skills/next/SKILL.md` for "priority" → found
- Test: grep `plugin/skills/next/SKILL.md` for "size" → found
- Test: grep `plugin/skills/next/SKILL.md` for "session-start" → found

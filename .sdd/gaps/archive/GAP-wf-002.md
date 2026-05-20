---
id: GAP-wf-002
spec-item: SPEC-wf-003
domain: workflow
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "b002e112"
closed-by: WI-wf-002
deferred-reason: null
---

# Gap: session-start next-action footer references individual pipeline skills, not sdd-worker

**Locations:**
- `/Users/srotbart/.claude/plugins/cache/sdd/sdd/0.1.0/skills/session-start/SKILL.md:79`
- `/Users/srotbart/.claude/plugins/cache/sdd/sdd/0.1.0/skills/session-start/SKILL.md:80`
- `/Users/srotbart/.claude/plugins/cache/sdd/sdd/0.1.0/skills/session-start/SKILL.md:81`

**Reasoning:** Lines 79–81 of the next-action table suggest `/sdd:spec-audit`, `/sdd:gap-to-work-items`, and `/sdd:work-item-close` directly — no row mentions `/sdd:spawn-sdd-worker` as the entry point for execution-phase work.

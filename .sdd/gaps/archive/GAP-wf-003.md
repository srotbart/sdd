---
id: GAP-wf-003
spec-item: SPEC-wf-004
domain: workflow
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "b002e112"
closed-by: WI-wf-003
deferred-reason: null
---

# Gap: sdd:init skill has no mention of the two-phase workflow or sdd-worker

**Location:** /Users/srotbart/.claude/plugins/cache/sdd/sdd/0.1.0/skills/init/SKILL.md — no reference to sdd-worker or execution phase

**Reasoning:** The init skill describes directory structure and target scaffolding but contains no description of the two-phase workflow (intent vs execution) or instruction to spawn sdd-worker after the spec is established.

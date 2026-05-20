---
id: GAP-wf-006
spec-item: SPEC-wf-006
domain: workflow
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "968a43a5"
closed-by: WI-wf-006
deferred-reason: null
---

# Gap: Worker prompt missing gap-report step and nothing-to-do shutdown instruction

**Locations:**
- `plugin/skills/spawn-sdd-worker/SKILL.md:50`
- `plugin/skills/spawn-sdd-worker/SKILL.md:43`

**Reasoning:** The prompt instructs the worker to proceed directly from sdd:spec-audit to sdd:gap-to-work-items without sending a gap report to the team lead, and contains no instruction to send a "nothing to do" message and shut down when the pipeline has no work.

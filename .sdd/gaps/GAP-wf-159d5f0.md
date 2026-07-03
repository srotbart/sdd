---
id: GAP-wf-159d5f0
spec-item: SPEC-wf-030
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "ce76b5ad"
closed-by: WI-wf-bf4727e
deferred-reason: null
---

# Gap: session-start orientation's concrete-skills chain omits close-domain

**Location:** `plugin/skills/session-start/SKILL.md:97`
**Reasoning:** The orientation's "Concrete skills: target-engage → spec-audit → gap-to-work-items → work-item-close" predates worker-v2 (SPEC-wf-038); per SPEC-wf-030 the orientation is the pipeline mental model and must reflect the execution trio being wrapped by the close-domain loop.

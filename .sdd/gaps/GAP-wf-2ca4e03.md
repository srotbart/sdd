---
id: GAP-wf-2ca4e03
spec-item: SPEC-wf-030
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "ce76b5ad"
closed-by: WI-wf-ae3e0af
deferred-reason: null
---

# Gap: README concrete-skill chain omits close-domain as the execution loop driver

**Location:** `README.md:31`
**Reasoning:** The README "Concrete skill chain: target-engage → spec-audit → gap-to-work-items → work-item-close" mentions spawn-sdd-worker but not `close-domain`, the loop the worker actually drives (SPEC-wf-038); per SPEC-wf-030 the pipeline model must not present a divergent copy that predates worker-v2.

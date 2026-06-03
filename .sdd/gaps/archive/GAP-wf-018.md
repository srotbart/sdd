---
id: GAP-wf-018
spec-item: SPEC-wf-011
domain: workflow
status: closed
discovered: "2026-06-02T00:00:00Z"
audit-spec-version: "6b73b4c4"
closed-by: WI-wf-018
deferred-reason: null
---

**Location:** `plugin/statusline.sh:49` — the printf line renders only gaps and work-items; `targets` and `specs` counts are absent

**Reasoning:** SPEC-wf-011 requires the SDD line to show all four counts in order (targets · specs · gaps · work items · hub link), but `statusline.sh` only renders gaps and work items, omitting targets and specs entirely.

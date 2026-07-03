---
id: GAP-wf-13dec58
spec-item: SPEC-wf-038
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "1be1ee27"
closed-by: WI-wf-e73d89c
deferred-reason: null
---

# Gap: close-domain skill does not exist

**Location:** `plugin/skills/close-domain/SKILL.md` (does not exist)
**Reasoning:** SPEC-wf-038 requires a `/sdd:close-domain {domain}` skill that structurally drives all five phases (orient, audit, decompose, close, guardian audit); no `plugin/skills/close-domain/` directory exists, so the loop lives only in the spawn prompt.

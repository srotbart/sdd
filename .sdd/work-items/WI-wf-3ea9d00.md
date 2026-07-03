---
id: WI-wf-3ea9d00
gap-id: GAP-wf-c7f9674
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: work-item-close verifies acceptance criteria and cross-domain self-check

**Scope:** `plugin/skills/work-item-close/SKILL.md` (verify/mark-done steps, ~lines 58-83) — before flipping a work item to `done`, add: (a) re-read the gap's spec item `## Acceptance criteria` and verify each against the code — "tests pass" alone is not completion; and (b) when invoked from `sdd:close-domain`, self-check the diff against every cross-domain spec item provided in context. The close-domain Phase 3 selection language is delivered by WI-wf-e73d89c; this item adds the verification/self-check duty in work-item-close. Depends on WI-wf-e73d89c.

**Acceptance criteria:**
- `work-item-close/SKILL.md` instructs re-reading and verifying each of the gap's spec item acceptance criteria against the code before marking done
- The skill states that "tests pass" alone is not completion
- The skill instructs a diff self-check against the cross-domain spec items provided when invoked from close-domain
- Test: a grep-style spec test (matching `hub/server/spec-wf-plugin.test.ts`) asserts work-item-close/SKILL.md contains an acceptance-criteria verification step and a cross-domain self-check step

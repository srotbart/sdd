---
id: GAP-wf-c7f9674
spec-item: SPEC-wf-040
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "182fe30c"
closed-by: WI-wf-3ea9d00
deferred-reason: null
---

# Gap: work-item-close does not verify acceptance criteria or self-check against cross-domain spec items

**Locations:**
- `plugin/skills/work-item-close/SKILL.md:58` — step 6 ("Verify") only runs tests; it never re-reads the gap's spec item `## Acceptance criteria` and verifies each against the code, so "tests pass" is treated as completion.
- `plugin/skills/close-domain/SKILL.md` (does not exist) — no procedure selects and loads relevant cross-domain spec items before implementing a work item, nor self-checks the diff against them.

**Reasoning:** SPEC-wf-040 requires per-work-item cross-domain spec selection (index + scope globs, discovery subagent when inconclusive with reported fallback) plus, before marking done, (a) verifying each acceptance criterion against the code and (b) self-checking the diff against every selected cross-domain item; neither the acceptance-criteria verification nor the cross-domain self-check exists.

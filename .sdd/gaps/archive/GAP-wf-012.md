---
id: GAP-wf-012
spec-item: SPEC-wf-008
domain: workflow
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "b56c0b34"
closed-by: WI-wf-012
deferred-reason: null
---

# Gap: spec-test skill has no next-step footer after the report section

**Location:** `plugin/skills/spec-test/SKILL.md:145`

**Reasoning:** The skill's report example (after the `---` divider at line 145) does not include a conditional next-step sentence; SPEC-wf-008 requires `sdd:spec-test` to end with "Run the test suite then `/sdd:session-start`".

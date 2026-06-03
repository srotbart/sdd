---
id: WI-wf-012
gap-id: GAP-wf-012
domain: workflow
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Add next-step footer to spec-test skill report section

**Scope:** `plugin/skills/spec-test/SKILL.md:145` — append a conditional next-step line after the report example block, following the pattern `---\nNext: {sentence}. Run \`/{command}\` to proceed.` per SPEC-wf-008.

**Acceptance criteria:**
- The skill's report section ends with a `---` divider followed by: "Run the test suite then `/sdd:session-start`" (or equivalent conditional form)
- The footer is conditional on outcome: when tests pass it suggests session-start; the wording matches the SPEC-wf-008 requirement for spec-test
- No other content is removed or modified
- Skill test: the SKILL.md file contains the required next-step footer text after the report example

---
id: WI-wf-57ebf0c
gap-id: GAP-wf-4d2b706
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Remove SPEC-wf-* citations from session-start SKILL.md and statusline.test.sh; add clean-state test

**Scope:** `plugin/skills/session-start/SKILL.md` (3 citations at lines 80, 167, 251 — SPEC-wf-023, SPEC-wf-029, SPEC-wf-035) and `plugin/statusline.test.sh` (1 citation at line 71 — SPEC-wf-001 in a test fixture, replace with a generic ID like SPEC-auth-001); add a final SPEC-wf-043 test to `hub/server/spec-wf-plugin.test.ts` asserting that no SPEC-wf-[0-9] citations remain in plugin/

**Acceptance criteria:**
- `plugin/skills/session-start/SKILL.md` contains no match for `SPEC-wf-[0-9]`
- `plugin/statusline.test.sh` contains no match for `SPEC-wf-[0-9]` (fixture uses generic ID instead)
- A new test in the SPEC-wf-043 describe block asserts: grepping `plugin/` recursively for `SPEC-wf-[0-9]` returns no matches (uses execFileSync with status-1 expected on no-match exit)
- All existing SPEC-wf-003, SPEC-wf-029 tests that read session-start and assert behavior phrases continue to pass
- All 8 work items for GAP-wf-4d2b706 are now closed; lint-check.sh passes on a clean tree with no SPEC-wf- violations

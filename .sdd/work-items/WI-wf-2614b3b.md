---
id: WI-wf-2614b3b
gap-id: GAP-wf-7c306de
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add lead/main redirect and escalate-on-spec-edit rule to close-domain SKILL.md

**Scope:** `plugin/skills/close-domain/SKILL.md` — (a) update the `description:` frontmatter field and preamble to identify close-domain as the sdd-worker's operating loop and redirect lead/main sessions to `/sdd:spawn-sdd-worker {domain}` instead; (b) add a constraint/rule stating that a gap fix requiring a spec item edit is an escalation, with mechanical `**Tests:**` linking and `scope:` backfill excepted

**Acceptance criteria:**
- The `description:` field names close-domain as the sdd-worker's operating loop and redirects lead/main sessions to `spawn-sdd-worker`
- The preamble (top prose block) removes "equally usable by a human driver" framing and adds the lead/main redirect
- A constraint or rule in the skill states that execution never modifies spec item files, and that a fix requiring a spec item edit escalates to the lead; mechanical `**Tests:**` linking and `scope:` backfill are explicitly excepted
- Test: `spec-wf-plugin.test.ts` — new `it` in the SPEC-wf-038 describe block asserting the description/preamble identifies close-domain as the sdd-worker loop and redirects to spawn-sdd-worker
- Test: `spec-wf-plugin.test.ts` — new `it` asserting the skill states that spec-item edits are escalations (mechanical writes excepted)
- Both new tests pass; all existing SPEC-wf-038 tests continue to pass

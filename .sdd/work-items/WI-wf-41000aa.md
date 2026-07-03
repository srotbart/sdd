---
id: WI-wf-41000aa
gap-id: GAP-wf-1e23a6f
domain: workflow
status: pending
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add "verify report claims at reporting time" constraint to close-domain SKILL.md

**Scope:** `plugin/skills/close-domain/SKILL.md` — add a constraint in the Phase 4 or reporting section stating that every factual claim in a completion or guardian report (file states, commit hashes, test counts, tree cleanliness) must be verified against the current tree at reporting time, never restated from memory or assumed state

**Acceptance criteria:**
- A rule/constraint is present in close-domain/SKILL.md (Phase 4 or Stop conditions section) requiring that completion and guardian report claims are verified against the current tree at reporting time
- The constraint covers at minimum: file states, commit hashes, test counts, and tree cleanliness
- The constraint states the prohibition: "never restat[e] remembered or assumed state" (or equivalent phrasing)
- Test: `spec-wf-plugin.test.ts` — new `it` in the SPEC-wf-041 describe block asserting the skill states report claims are verified at reporting time
- New test passes; all existing SPEC-wf-041 tests continue to pass

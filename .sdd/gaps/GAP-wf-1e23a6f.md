---
id: GAP-wf-1e23a6f
spec-item: SPEC-wf-041
domain: workflow
status: open
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "78757f1d"
closed-by: null
deferred-reason: null
---

# Gap: close-domain SKILL.md missing "verify report claims at reporting time" constraint

**Location:** `plugin/skills/close-domain/SKILL.md` (Phase 4 and Stop conditions/reporting sections) — no instruction that every factual claim in a completion or guardian report (file states, commit hashes, test counts, tree cleanliness) must be verified against the current tree at reporting time rather than restated from memory.

**Reasoning:** SPEC-wf-041 AC 7 requires the skill to state that report claims are verified at reporting time, never restated from memory; this constraint is absent from the skill.

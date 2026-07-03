---
id: GAP-wf-cec52f0
spec-item: SPEC-wf-041
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "41851f48"
closed-by: WI-wf-e73d89c
deferred-reason: null
---

# Gap: guardian cross-domain audit does not gate worker completion

**Location:** `plugin/skills/close-domain/SKILL.md` (does not exist)
**Reasoning:** SPEC-wf-041 requires a Phase 4 guardian audit — record the run's git start point, diff changed files against it, map them to spec items across all domains, fix own-run violations inline (no gap artifacts) and re-audit, escalate on judgment cases, report pre-existing violations as candidate gaps, and report complete only on a clean audit; no close-domain skill exists, so nothing gates completion.

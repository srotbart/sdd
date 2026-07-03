---
id: GAP-wf-7c306de
spec-item: SPEC-wf-038
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "388febed"
closed-by: WI-wf-2614b3b
deferred-reason: null
---

# Gap: close-domain SKILL.md missing escalate-on-spec-edit rule and lead/main-session redirect

**Locations:**
- `plugin/skills/close-domain/SKILL.md:3-4` (description field) — no redirect of lead/main sessions to `/sdd:spawn-sdd-worker`; description implies direct human use is fine
- `plugin/skills/close-domain/SKILL.md:9-16` (preamble) — says "equally usable by a human driver who wants the whole pipeline in one invocation" instead of redirecting lead/main sessions to `spawn-sdd-worker`
- `plugin/skills/close-domain/SKILL.md` (Phase 3 / Phase 4 / Constraints) — no rule stating that a gap fix requiring a spec item edit is an escalation (with mechanical `**Tests:**`/`scope:` writes excepted)

**Reasoning:** SPEC-wf-038 AC 6+7 require (a) the skill to state that fixes needing spec edits escalate to the lead (mechanical writes only excepted) and (b) the description and preamble to identify close-domain as the sdd-worker's operating loop and redirect lead/main sessions to spawn-sdd-worker; both are absent.

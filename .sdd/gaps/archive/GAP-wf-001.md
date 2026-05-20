---
id: GAP-wf-001
spec-item: SPEC-wf-007
domain: workflow
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "6198c4b2"
closed-by: WI-wf-007
deferred-reason: null
---

# Gap: spawn-sdd-worker uses hardcoded team name "sdd-execution" instead of deriving from project root

**Locations:**
- `plugin/skills/spawn-sdd-worker/SKILL.md:37` — `TeamCreate({ name: "sdd-execution" })` hardcodes the team name
- `plugin/skills/spawn-sdd-worker/SKILL.md:45` — `team_name: "sdd-execution"` hardcodes the Agent tool parameter
- `plugin/skills/spawn-sdd-worker/SKILL.md:104` — `TeamDelete({ name: "sdd-execution" })` hardcodes cleanup name

**Reasoning:** All three locations use the literal string `"sdd-execution"` rather than deriving `sdd-{last-path-segment-of-project-root}`, causing cross-session collisions when two Claude sessions in different projects run the skill concurrently.

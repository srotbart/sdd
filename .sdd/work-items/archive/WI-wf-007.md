---
id: WI-wf-007
gap-id: GAP-wf-001
domain: workflow
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Derive team name from project root in spawn-sdd-worker

**Scope:** `plugin/skills/spawn-sdd-worker/SKILL.md` — replace hardcoded `"sdd-execution"` with `sdd-{last-path-segment-of-project-root}` in TeamCreate, Agent `team_name` parameter, and TeamDelete calls

**Acceptance criteria:**
- TeamCreate call uses a name derived as `sdd-{basename of project root}`, not the literal string `"sdd-execution"`
- Agent tool `team_name` parameter uses the same derived name
- TeamDelete call uses the same derived name
- Skill instructions explain how to compute the project slug (e.g., `basename $PWD` or the last path component of the working directory)
- Integration note: two concurrent sessions in different project directories produce different team names

---
id: WI-wf-005
gap-id: GAP-wf-005
domain: workflow
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add TeamCreate and team_name to spawn-sdd-worker procedure

**Scope:** `plugin/skills/spawn-sdd-worker/SKILL.md:34` — revise step 2 to call TeamCreate before spawning the worker, then pass the created team's name via the `team_name` parameter on the Agent tool call; add a cleanup step calling TeamDelete after the worker completes or is shut down

**Acceptance criteria:**
- Step 2 begins with a TeamCreate call (e.g., `TeamCreate({ name: "sdd-execution" })`) before the Agent tool call
- The Agent tool call includes `team_name` set to the created team name
- A step after the worker completes references TeamDelete to clean up the team
- Skill text test: the SKILL.md body contains "TeamCreate" and "team_name" in the spawn procedure section
- Skill text test: the SKILL.md body contains "TeamDelete" in the cleanup/shutdown section

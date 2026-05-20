---
id: GAP-wf-005
spec-item: SPEC-wf-005
domain: workflow
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "968a43a5"
closed-by: WI-wf-005
deferred-reason: null
---

# Gap: spawn-sdd-worker does not use TeamCreate before spawning the worker agent

**Location:** `plugin/skills/spawn-sdd-worker/SKILL.md:34`

**Reasoning:** Step 2 instructs using the Agent tool with `name`, `subagent_type`, and `run_in_background` but omits `TeamCreate` and the `team_name` parameter; agents spawned without a team context lack Skill tool access and cannot invoke SDD skills.

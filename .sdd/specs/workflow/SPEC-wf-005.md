---
id: SPEC-wf-005
domain: workflow
abbrev: wf
status: active
aliases: []
version: "5999ec50"
---

# SPEC-wf-005 — sdd-worker is spawned via the Agent tool with no team setup step

## Invariant

The `sdd:spawn-sdd-worker` skill spawns the `sdd-worker` agent directly via the `Agent`
tool, with no separate team setup or teardown step. It does not call `TeamCreate` before
spawning and does not call `TeamDelete` afterwards — as of Claude Code v2.1.178 both tools
no longer exist; the team context is created automatically when the worker is spawned and
removed automatically when the session exits. The skill does not pass a `team_name`
parameter to the Agent tool (the input is accepted but ignored). The worker inherits the
Skill tool from its `general-purpose` `subagent_type`, so it can invoke the SDD skills
(`sdd:spec-audit`, `sdd:gap-to-work-items`, `sdd:work-item-close`) without any team-context
setup.

## Acceptance criteria

- `spawn-sdd-worker` does not invoke `TeamCreate` and does not invoke `TeamDelete`
- The Agent tool spawn parameters do not include a `team_name` entry
- The skill documents that team setup and cleanup happen automatically (no setup step)
- The worker can invoke `sdd:spec-audit`, `sdd:gap-to-work-items`, and `sdd:work-item-close`
  via the Skill tool inherited from its `general-purpose` agent type

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-005: sdd-worker is spawned via the Agent tool with no team setup step > SPEC-wf-005: does not invoke TeamCreate` — no `TeamCreate({ ... })` call appears in the skill
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-005: sdd-worker is spawned via the Agent tool with no team setup step > SPEC-wf-005: does not invoke TeamDelete` — no `TeamDelete({ ... })` call appears in the skill
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-005: sdd-worker is spawned via the Agent tool with no team setup step > SPEC-wf-005: the Agent spawn parameters do not include team_name` — no `team_name` parameter bullet in the spawn list
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-005: sdd-worker is spawned via the Agent tool with no team setup step > SPEC-wf-005: documents that team setup and cleanup are automatic` — the skill states no setup step is required

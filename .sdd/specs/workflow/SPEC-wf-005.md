---
id: SPEC-wf-005
domain: workflow
abbrev: wf
status: active
aliases: []
version: "4062d5c0"
---

# SPEC-wf-005 — sdd-worker is spawned via TeamCreate to ensure Skill tool access

## Invariant

The `sdd:spawn-sdd-worker` skill must use `TeamCreate` to create a named team before spawning the worker agent. The worker is then spawned via the `Agent` tool with the `team_name` parameter set to the created team's name. Agents spawned without a team context do not have access to the Skill tool and therefore cannot invoke SDD skills (`sdd:spec-audit`, `sdd:gap-to-work-items`, `sdd:work-item-close`). The team should be cleaned up via `TeamDelete` after the worker completes or is shut down.

## Acceptance criteria

- `spawn-sdd-worker` calls `TeamCreate` before calling the Agent tool
- The Agent tool call passes `team_name` set to the created team's name
- The worker can successfully invoke `sdd:spec-audit`, `sdd:gap-to-work-items`, and `sdd:work-item-close` via the Skill tool
- `TeamDelete` is called after the worker completes or is shut down

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-005: sdd-worker spawned via TeamCreate for Skill tool access > SPEC-wf-005: calls TeamCreate before the Agent spawn parameters block` — a team is created before the agent is spawned
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-005: sdd-worker spawned via TeamCreate for Skill tool access > SPEC-wf-005: the Agent spawn passes a team_name parameter` — the agent is spawned into the named team
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-005: sdd-worker spawned via TeamCreate for Skill tool access > SPEC-wf-005: TeamDelete is called for cleanup after the worker completes` — the team is cleaned up after completion

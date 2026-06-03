---
id: SPEC-wf-005
domain: workflow
abbrev: wf
status: active
aliases: []
version: "7e0d6d47"
---

# SPEC-wf-005 — sdd-worker is spawned via TeamCreate to ensure Skill tool access

## Invariant

The `sdd:spawn-sdd-worker` skill must use `TeamCreate` to create a named team before spawning the worker agent. The worker is then spawned via the `Agent` tool with the `team_name` parameter set to the created team's name. Agents spawned without a team context do not have access to the Skill tool and therefore cannot invoke SDD skills (`sdd:spec-audit`, `sdd:gap-to-work-items`, `sdd:work-item-close`). The team should be cleaned up via `TeamDelete` after the worker completes or is shut down.

## Acceptance criteria

- `spawn-sdd-worker` calls `TeamCreate` before calling the Agent tool
- The Agent tool call passes `team_name` set to the created team's name
- The worker can successfully invoke `sdd:spec-audit`, `sdd:gap-to-work-items`, and `sdd:work-item-close` via the Skill tool
- `TeamDelete` is called after the worker completes or is shut down

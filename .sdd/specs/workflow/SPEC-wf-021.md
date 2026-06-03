---
id: SPEC-wf-021
domain: workflow
abbrev: wf
status: active
aliases: []
version: "35c9870d"
---

# SPEC-wf-021 — sdd-worker is spawned with the sonnet model

## Invariant

When `sdd:spawn-sdd-worker` spawns the `sdd-worker` agent via the Agent tool, it sets the `model` parameter explicitly to `"sonnet"` rather than letting the agent inherit the session model (typically opus). The `model` field appears in the documented spawn parameter list alongside `name`, `subagent_type`, `run_in_background`, and `team_name`. The execution phase the worker runs (`sdd:spec-audit` → `sdd:gap-to-work-items` → `sdd:work-item-close`) is deterministic given a clear spec, so sonnet is sufficient; pinning it avoids running the mechanical pipeline on the more expensive model.

## Acceptance criteria

- `plugin/skills/spawn-sdd-worker/SKILL.md` lists `model: "sonnet"` in the Agent tool spawn parameters
- The `model` parameter is set on the same Agent tool call that sets `name: "sdd-worker"`
- The worker is not spawned with opus or by inheriting the session model
- Re-spawning a worker for an additional domain (or via SendMessage reuse) does not change the pinned model

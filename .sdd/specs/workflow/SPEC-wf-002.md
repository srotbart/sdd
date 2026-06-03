---
id: SPEC-wf-002
domain: workflow
abbrev: wf
status: active
aliases: []
version: "610144da"
---

# SPEC-wf-002 — /sdd:spawn-sdd-worker skill creates a persistent sdd-worker agent

## Invariant

A skill `/sdd:spawn-sdd-worker` exists in the SDD plugin. When invoked with a domain argument, it uses the Agent tool to spawn a persistent agent named `sdd-worker`. The agent's prompt instructs it to run the full execution pipeline for the given domain: run `sdd:spec-audit` on the domain, then `sdd:gap-to-work-items`, then call `sdd:work-item-close` for each open work item in sequence until none remain. The worker is not a one-shot subagent — it is named so it can be sent additional domains via `SendMessage` and reused across pipeline runs in the same session.

## Acceptance criteria

- `plugin/skills/spawn-sdd-worker/SKILL.md` exists in the SDD plugin
- The skill spawns an agent with `name: "sdd-worker"` using the Agent tool
- The worker prompt instructs running `sdd:spec-audit` → `sdd:gap-to-work-items` → `sdd:work-item-close` in sequence
- The worker can receive additional domains via `SendMessage` without re-spawning

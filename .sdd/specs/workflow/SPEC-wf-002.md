---
id: SPEC-wf-002
domain: workflow
abbrev: wf
status: active
aliases: []
version: "1b9a9a3e"
---

# SPEC-wf-002 — /sdd:spawn-sdd-worker skill creates a persistent sdd-worker agent

## Invariant

A skill `/sdd:spawn-sdd-worker` exists in the SDD plugin. When invoked with a domain argument, it uses the Agent tool to spawn a persistent agent named `sdd-worker`. The agent's prompt instructs it to run the full execution pipeline for the given domain: run `sdd:spec-audit` on the domain, then `sdd:gap-to-work-items`, then call `sdd:work-item-close` for each open work item in sequence until none remain. The worker is not a one-shot subagent — it is named so it can be sent additional domains via `SendMessage` and reused across pipeline runs in the same session.

## Acceptance criteria

- `plugin/skills/spawn-sdd-worker/SKILL.md` exists in the SDD plugin
- The skill spawns an agent with `name: "sdd-worker"` using the Agent tool
- The worker prompt instructs running `sdd:spec-audit` → `sdd:gap-to-work-items` → `sdd:work-item-close` in sequence
- The worker can receive additional domains via `SendMessage` without re-spawning

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-002: spawn-sdd-worker creates a persistent sdd-worker agent > SPEC-wf-002: the spawn-sdd-worker SKILL.md exists in the plugin` — the spawn-sdd-worker skill is a committed plugin artifact
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-002: spawn-sdd-worker creates a persistent sdd-worker agent > SPEC-wf-002: spawns an agent named sdd-worker` — the skill spawns a named sdd-worker agent
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-002: spawn-sdd-worker creates a persistent sdd-worker agent > SPEC-wf-002: the worker prompt sequences spec-audit then gap-to-work-items then work-item-close` — the prompt orders the execution pipeline correctly
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-002: spawn-sdd-worker creates a persistent sdd-worker agent > SPEC-wf-002: documents reuse via SendMessage for additional domains without re-spawning` — the worker is reusable for further domains via SendMessage

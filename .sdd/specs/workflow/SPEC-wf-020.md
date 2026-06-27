---
id: SPEC-wf-020
domain: workflow
abbrev: workflow
status: active
aliases: []
version: "dc2d66b5"
---

# SPEC-wf-020 — sdd:explain skill spawns a dedicated sdd-explainer agent

## Invariant

The `sdd:explain <subject>` skill spawns a dedicated agent named `sdd-explainer` (general-purpose, sonnet model) via the Agent tool, with no separate team setup step. It does not derive a `sdd-explain-{project-slug}` team name, does not call `TeamCreate`, and does not pass a `team_name` parameter — as of Claude Code v2.1.178 those tools no longer exist; team context is created automatically when the agent is spawned and removed automatically when the session exits. On spawn the agent asks the user one question: interactive or non-interactive? It then immediately writes a skeleton header to `.sdd/projections/<subject>.md` so the Hub shows something at once. In interactive mode the agent writes the main concept section first — searching `.sdd/specs/` for relevant items first as authoritative ground truth, then reading relevant code — then asks the user what to explore next each turn, writing each directed section to the file before asking again. In non-interactive mode the agent traverses autonomously (specs → code entry points → key components) and writes the complete document without asking. The user manages the agent lifecycle; the skill does not check for an existing agent before spawning.

## Acceptance criteria

- Invoking `/sdd:explain <subject>` spawns `sdd-explainer` via the Agent tool with no team setup step (no `TeamCreate`, no `team_name` parameter)
- Agent's first action is to ask: interactive or non-interactive?
- Agent immediately writes `.sdd/projections/<subject>.md` with a header skeleton before doing any research
- In interactive mode: agent writes main concept section (specs first, then code), then sends user a message asking what to explore next; repeats each turn
- In non-interactive mode: agent traverses autonomously and writes the full document without user prompts, then shuts down
- Specs are always consulted first as the authoritative layer before reading code
- `.sdd/projections/` directory is created if it does not exist

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-020: sdd:explain skill spawns a dedicated sdd-explainer agent > SPEC-wf-020: spawns sdd-explainer via the Agent tool with no team setup` — the skill spawns the explainer with no TeamCreate/team_name
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-020: sdd:explain skill spawns a dedicated sdd-explainer agent > SPEC-wf-020: pins the sonnet model for the explainer agent` — the explainer is pinned to sonnet
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-020: sdd:explain skill spawns a dedicated sdd-explainer agent > SPEC-wf-020: writes the projection to .sdd/projections/<subject>.md` — the agent writes to the projections file
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-020: sdd:explain skill spawns a dedicated sdd-explainer agent > SPEC-wf-020: agent's first action asks interactive vs non-interactive` — the agent first asks interactive vs non-interactive
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-020: sdd:explain skill spawns a dedicated sdd-explainer agent > SPEC-wf-020: consults .sdd/specs first as authoritative ground truth before code` — specs are consulted before code

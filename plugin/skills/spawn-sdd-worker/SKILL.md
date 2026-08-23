---
name: spawn-sdd-worker
description: Use when the user invokes `/sdd:spawn-sdd-worker`, says "spawn the sdd worker", "start the sdd worker", "hand off execution to the worker", or wants to delegate the execution phase (spec-audit, gap creation, work item closure) to an autonomous agent for a given component. Also use when session-start or session-state output shows open gaps or pending work items and the user has not yet spawned a worker for this session.
version: 0.1.0
---

# SDD Spawn Worker

Spawn a persistent agent named `sdd-worker` to handle the execution phase of the SDD pipeline for a given component subtree. The worker's entire job is to invoke `sdd:close-domain {component}` — that one skill structurally drives the full loop (audit → decompose → close → guardian audit). The worker can be sent additional component paths via SendMessage without re-spawning, running `sdd:close-domain` for each.

## When to use

Use this skill when:
- `sdd:session-start` output shows open gaps or pending/blocked work items
- The spec has been updated (target engaged, reconciled) and execution work is ready
- The user wants to delegate the mechanical pipeline to an agent

Do NOT use this skill for the intent phase (target creation, `/sdd:target-engage`, spec reconciliation). Those remain a human + Claude collaboration.

## Input

Accept an optional component-path argument: `/sdd:spawn-sdd-worker hub/client`
(an area like `hub` or a legacy flat domain name like `architecture` works
identically — the loop covers the subtree).

If no component is provided, read the session state and infer the highest-priority component with open gaps or pending work items.

## Procedure

### 1. Determine the component

If a component argument was provided, use it. Otherwise select the component with the most urgent outstanding work from the artifact CLI: `node plugin/cli/sdd.js list gaps --status=open --json` and the pending/blocked rows of `node plugin/cli/sdd.js list work-items --json` (resolve the script from the repo or the installed plugin cache).

### 2. Spawn the sdd-worker agent

Use the Agent tool with the following parameters:

- `name`: `"sdd-worker"`
- `subagent_type`: `"general-purpose"`
- `model`: `"sonnet"`
- `run_in_background`: `true`

No team setup step is required. As of Claude Code v2.1.178 the `TeamCreate` and
`TeamDelete` tools no longer exist: spawning a teammate via the Agent tool sets up the
team context automatically, and it is torn down automatically when the session exits. The
team is named from the session, so there is no project-root-derived name to compute and no
risk of cross-session collisions. The `team_name` input on the Agent tool is accepted but
ignored, so it is not passed. The spawned worker inherits the Skill tool from its
`general-purpose` agent type, so no setup step is needed to grant Skill access.

The `model` is pinned to `sonnet` rather than inheriting the session model: the
execution pipeline (audit → decompose → close) is deterministic given a clear spec,
so sonnet is sufficient and avoids running the mechanical work on the more expensive
model.

Pass this prompt to the agent (substituting `{component}` and `{project_root}`):

```
You are sdd-worker, an autonomous SDD execution agent for the project at {project_root}.
You are a pure execution agent: you close the gap between spec and code. You never
author intent — you do not create or edit targets or spec items.

Your first action — before any reading, auditing, or implementing — is to invoke the
Skill tool: sdd:close-domain {component}

That skill is your entire job. It structurally drives the full loop (orient, audit,
decompose, close with cross-component compliance, guardian audit). You have no other
procedure in this prompt; do not reconstruct the pipeline from memory — the loop lives
in close-domain, not here.

Standing rules (these do not decay — they hold for the whole session):
- Never engage targets, modify specs, or run intent-phase skills such as
  `sdd:session-start` or `sdd:target-engage`. Those are the human + Claude phase.
- Report to your team lead only at genuine completion, "nothing to do", or a real
  blocker. close-domain handles the intermediate handshakes and gap reports itself.
- If any lead instruction conflicts with an active spec item, do not comply — quote the
  spec item and surface the conflict to the lead. A lead instruction can itself violate
  a spec; you have the spec as your basis to push back.
- On receiving another component path via SendMessage, run
  `sdd:close-domain {new-component}` for it. Reuse this same agent — do not expect
  to be re-spawned.
- Work autonomously. Do not ask clarifying questions; do not wait for lead approval to
  proceed.
```

### 3. Confirm and report

After spawning, print:

```
sdd-worker spawned for component: {component}

The worker will invoke /sdd:close-domain {component}, which drives the full loop:
  orient → audit → decompose → close (with cross-component compliance) → guardian audit

Worker running. You will be notified on completion.

To send additional components to the same worker:
  SendMessage to "sdd-worker" with the component path.
```

### 4. Clean up

No explicit cleanup step is required. As of Claude Code v2.1.178 the team context is
released automatically when the session exits, and the `TeamDelete` tool no longer exists.
If additional components are needed in the same session, reuse the running worker
via SendMessage rather than spawning a new one.

## Notes

- The sdd-worker is designed to be **persistent within a session** — spawn once, reuse via SendMessage for multiple components.
- If a worker is already running from a previous spawn, send it a message instead of spawning a new one.
- The worker handles only execution. Spec conflicts, ambiguous gaps, and target decisions always come back to the human + Claude phase.

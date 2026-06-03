---
name: spawn-sdd-worker
description: Use when the user invokes `/sdd:spawn-sdd-worker`, says "spawn the sdd worker", "start the sdd worker", "hand off execution to the worker", or wants to delegate the execution phase (spec-audit, gap creation, work item closure) to an autonomous agent for a given domain. Also use when session-start or session-state output shows open gaps or pending work items and the user has not yet spawned a worker for this session.
version: 0.1.0
---

# SDD Spawn Worker

Spawn a persistent agent named `sdd-worker` to handle the execution phase of the SDD pipeline for a given domain. The worker runs `sdd:spec-audit` → `sdd:gap-to-work-items` → `sdd:work-item-close` autonomously and can be sent additional domains via SendMessage without re-spawning.

## When to use

Use this skill when:
- `sdd:session-start` output shows open gaps or pending/blocked work items
- The spec has been updated (target engaged, reconciled) and execution work is ready
- The user wants to delegate the mechanical pipeline to an agent

Do NOT use this skill for the intent phase (target creation, `/sdd:target-engage`, spec reconciliation). Those remain a human + Claude collaboration.

## Input

Accept an optional domain argument: `/sdd:spawn-sdd-worker architecture`

If no domain is provided, read the session state and infer the highest-priority domain with open gaps or pending work items.

## Procedure

### 1. Determine the domain

If a domain argument was provided, use it. Otherwise, scan `.sdd/gaps/` for open gaps and `.sdd/work-items/` for pending/blocked items and select the domain with the most urgent outstanding work.

### 2. Spawn the sdd-worker agent

First, derive a unique team name from the last path segment of the project root so
that concurrent Claude sessions in different projects do not collide on the same team
name:

```bash
basename "$PWD"   # e.g. "sdd-repo" → team name becomes "sdd-sdd-repo"
```

The team name is `sdd-{project-slug}` where `{project-slug}` is the final directory
component of the working directory. Store it as `{team_name}`.

Create the named team so the worker has access to the Skill tool:

```
TeamCreate({ name: "{team_name}" })
```

Then use the Agent tool with the following parameters:

- `name`: `"sdd-worker"`
- `subagent_type`: `"general-purpose"`
- `model`: `"sonnet"`
- `run_in_background`: `true`
- `team_name`: `"{team_name}"`

The `model` is pinned to `sonnet` rather than inheriting the session model: the
execution pipeline (audit → decompose → close) is deterministic given a clear spec,
so sonnet is sufficient and avoids running the mechanical work on the more expensive
model.

Pass this prompt to the agent (substituting `{domain}`, `{project_root}`, and `{team_name}`):

```
You are sdd-worker, an autonomous SDD execution agent for the project at {project_root}.

Your job is to close the execution pipeline for domain: {domain}

Work through these steps in order, using the Skill tool for each:

1. Run /sdd:spec-audit {domain}
   - This writes gap files for any spec divergences found.
   - After the audit completes, send a message to your team lead listing every gap
     found (IDs and locations). If no gaps were found, send a "nothing to do"
     message to the team lead and stop — do not proceed to step 2.

2. Run /sdd:gap-to-work-items {domain}
   - This decomposes open gaps into work items.
   - If no work items exist after decomposition, send a "nothing to do" message
     to the team lead and stop — do not proceed to step 3.

3. For each open work item in the domain (check .sdd/work-items/WI-{abbrev}-*.md):
   - Run /sdd:work-item-close WI-{id} for each pending/in-progress item in sequence.
   - Do not skip work items. Complete them one at a time.

After closing all work items for {domain}, check if you have received any messages (via SendMessage) with additional domains to process. If so, repeat the pipeline for each new domain.

If you encounter a blocker (a work item that cannot proceed without human input), stop and report the blocker clearly. Do not attempt to work around it.

Rules:
- Never engage targets or modify specs — that is the human + Claude phase.
- Never invoke intent-phase skills: do not run `sdd:session-start`, `sdd:target-engage`, or any skill that reads or writes targets or specs outside the audit/decompose/close pipeline.
- Only run the execution pipeline: audit → decompose → close.
- Work autonomously. Do not ask clarifying questions.
```

### 3. Confirm and report

After spawning, print:

```
sdd-worker spawned for domain: {domain}

The worker will run:
  1. /sdd:spec-audit {domain}
  2. /sdd:gap-to-work-items {domain}
  3. /sdd:work-item-close — for each open work item

Worker running. You will be notified on completion.

To send additional domains to the same worker:
  SendMessage to "sdd-worker" with the domain name.
```

### 4. Clean up the team

When the worker signals completion or is shut down, call TeamDelete to remove the team:

```
TeamDelete({ name: "{team_name}" })
```

This releases the team context. If additional domains are needed in the same session, the worker can be reused via SendMessage before cleanup — only call TeamDelete when no further execution work is expected.

## Notes

- The sdd-worker is designed to be **persistent within a session** — spawn once, reuse via SendMessage for multiple domains.
- If a worker is already running from a previous spawn, send it a message instead of spawning a new one.
- The worker handles only execution. Spec conflicts, ambiguous gaps, and target decisions always come back to the human + Claude phase.

---
id: SPEC-wf
domain: workflow
abbrev: wf
version: "bb60c3fc"
aliases: []
---

# Spec: Workflow

## SPEC-wf-001 — SDD has two phases: intent (human+Claude) and execution (sdd-worker)
*Status: active | Aliases: none*

The SDD pipeline splits into two phases with different actors. The **intent phase** (human + Claude) covers target creation, `/sdd:target-engage`, and spec reconciliation — it requires judgment and human sign-off and is never delegated to an automated agent. The **execution phase** (sdd-worker) covers `sdd:spec-audit`, `sdd:gap-to-work-items`, and `sdd:work-item-close` — it is deterministic given a clear spec and runs autonomously without human involvement.

## SPEC-wf-002 — /sdd:spawn-sdd-worker skill creates a persistent sdd-worker agent
*Status: active | Aliases: none*

A skill `/sdd:spawn-sdd-worker` exists in the SDD plugin. When invoked with a domain argument, it uses the Agent tool to spawn a persistent agent named `sdd-worker`. The agent's prompt instructs it to run the full execution pipeline for the given domain: run `sdd:spec-audit` on the domain, then `sdd:gap-to-work-items`, then call `sdd:work-item-close` for each open work item in sequence until none remain. The worker is not a one-shot subagent — it is named so it can be sent additional domains via `SendMessage` and reused across pipeline runs in the same session.

## SPEC-wf-003 — sdd:session-start next-action footer references sdd-worker for execution work
*Status: active | Aliases: none*

When `sdd:session-start` detects open gaps or pending/blocked work items, the next-action footer suggests `/sdd:spawn-sdd-worker {domain}` rather than the individual pipeline skills (`/sdd:spec-audit`, `/sdd:gap-to-work-items`, `/sdd:work-item-close`). If a worker is already running, the footer instructs the user to send the domain to the existing worker instead of spawning a new one.

## SPEC-wf-005 — sdd-worker is spawned via TeamCreate to ensure Skill tool access
*Status: active | Aliases: none*

The `sdd:spawn-sdd-worker` skill must use `TeamCreate` to create a named team before spawning the worker agent. The worker is then spawned via the `Agent` tool with the `team_name` parameter set to the created team's name. Agents spawned without a team context do not have access to the Skill tool and therefore cannot invoke SDD skills (`sdd:spec-audit`, `sdd:gap-to-work-items`, `sdd:work-item-close`). The team should be cleaned up via `TeamDelete` after the worker completes or is shut down.

## SPEC-wf-006 — sdd-worker prompt defines role, responsibilities, and gap reporting
*Status: active | Aliases: none*

The prompt passed to the sdd-worker by `sdd:spawn-sdd-worker` must open with an explicit role declaration: the worker is a pure execution agent responsible for running `sdd:spec-audit`, `sdd:gap-to-work-items`, and `sdd:work-item-close` in sequence for the assigned domain. It does not engage targets, reconcile specs, or run intent-phase skills such as `sdd:session-start` or `sdd:target-engage`. If there is nothing to execute (no new spec items, no open gaps, no pending work items), it sends a "nothing to do" message to the team lead and shuts down rather than looking for work. After completing `sdd:spec-audit`, the worker sends a message to the team lead listing every gap found (IDs and locations) before proceeding to `sdd:gap-to-work-items`. The worker continues autonomously after reporting — lead approval is not required.

## SPEC-wf-007 — spawn-sdd-worker derives a unique team name from the project root
*Status: active | Aliases: none*

The `sdd:spawn-sdd-worker` skill derives the TeamCreate name from the last path segment of the project root: `sdd-{project-slug}` where `{project-slug}` is the final directory component (e.g. `sdd-sdd-repo` for a project rooted at `.../sdd-repo`). Using a fixed name such as `sdd-execution` causes cross-session collisions when two Claude sessions in different projects run the skill concurrently — the Hub delivers completion messages to the wrong session lead. The derived name is also used when sending additional domains to an already-running worker via SendMessage.

## SPEC-wf-004 — sdd:init describes the two-phase workflow
*Status: active | Aliases: none*

The `sdd:init` skill output includes a description of the two-phase workflow: the intent phase (human + Claude, using `/sdd:target-engage`) and the execution phase (sdd-worker, using `/sdd:spawn-sdd-worker`). This sets expectations for new users so they understand which phase they are responsible for and which they delegate.

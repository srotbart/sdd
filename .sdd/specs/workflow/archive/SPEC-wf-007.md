---
id: SPEC-wf-007
domain: workflow
abbrev: wf
status: deprecated
aliases: []
version: "0eb0e8bb"
---

# SPEC-wf-007 — spawn-sdd-worker derives a unique team name from the project root

> **Deprecated 2026-06-27 (TGT-117).** This invariant no longer holds. As of Claude Code
> v2.1.178 the `TeamCreate` tool was removed and the Agent tool's `team_name` input is
> ignored; the team is named automatically from the session, so there is no
> project-root-derived team name to compute and cross-session collisions are handled by the
> platform. `spawn-sdd-worker` no longer derives a team name. Spawn behavior is now governed
> by SPEC-wf-005. Retained for history; not evaluated by spec-audit.

## Invariant

The `sdd:spawn-sdd-worker` skill derives the TeamCreate name from the last path segment of the project root: `sdd-{project-slug}` where `{project-slug}` is the final directory component (e.g. `sdd-sdd-repo` for a project rooted at `.../sdd-repo`). Using a fixed name such as `sdd-execution` causes cross-session collisions when two Claude sessions in different projects run the skill concurrently — the Hub delivers completion messages to the wrong session lead. The derived name is also used when sending additional domains to an already-running worker via SendMessage.

## Acceptance criteria

- Team name is derived as `sdd-{basename of $PWD}`, not a hardcoded string
- Two concurrent Claude sessions in different project directories produce different team names
- The same derived team name is used when sending additional domains to an already-running worker via SendMessage

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-007: spawn-sdd-worker derives a unique team name from the project root > SPEC-wf-007: team name is derived from basename of the project root, not hardcoded` — the team name is derived from $PWD basename, not a fixed string
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-007: spawn-sdd-worker derives a unique team name from the project root > SPEC-wf-007: the derived name is reused when sending additional domains via SendMessage` — the same derived name is reused for SendMessage

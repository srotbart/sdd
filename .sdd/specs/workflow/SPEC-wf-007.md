---
id: SPEC-wf-007
domain: workflow
abbrev: wf
status: active
aliases: []
version: "910f7ba5"
---

# SPEC-wf-007 — spawn-sdd-worker derives a unique team name from the project root

## Invariant

The `sdd:spawn-sdd-worker` skill derives the TeamCreate name from the last path segment of the project root: `sdd-{project-slug}` where `{project-slug}` is the final directory component (e.g. `sdd-sdd-repo` for a project rooted at `.../sdd-repo`). Using a fixed name such as `sdd-execution` causes cross-session collisions when two Claude sessions in different projects run the skill concurrently — the Hub delivers completion messages to the wrong session lead. The derived name is also used when sending additional domains to an already-running worker via SendMessage.

## Acceptance criteria

- Team name is derived as `sdd-{basename of $PWD}`, not a hardcoded string
- Two concurrent Claude sessions in different project directories produce different team names
- The same derived team name is used when sending additional domains to an already-running worker via SendMessage

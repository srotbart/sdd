---
id: SPEC-wf-004
domain: workflow
abbrev: wf
status: active
aliases: []
version: "879a8644"
---

# SPEC-wf-004 — sdd:init describes the two-phase workflow

## Invariant

The `sdd:init` skill output includes a description of the two-phase workflow: the intent phase (human + Claude, using `/sdd:target-engage`) and the execution phase (sdd-worker, using `/sdd:spawn-sdd-worker`). This sets expectations for new users so they understand which phase they are responsible for and which they delegate.

## Acceptance criteria

- `sdd:init` output contains a "Two-phase workflow" (or equivalent) section
- The section names `/sdd:target-engage` as the intent-phase skill
- The section names `/sdd:spawn-sdd-worker` as the execution-phase skill
- The section distinguishes which phase the human is responsible for vs. which is delegated

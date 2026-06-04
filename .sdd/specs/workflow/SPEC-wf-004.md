---
id: SPEC-wf-004
domain: workflow
abbrev: wf
status: active
aliases: []
version: "3f175611"
---

# SPEC-wf-004 — sdd:init describes the two-phase workflow

## Invariant

The `sdd:init` skill output includes a description of the two-phase workflow: the intent phase (human + Claude, using `/sdd:target-engage`) and the execution phase (sdd-worker, using `/sdd:spawn-sdd-worker`). This sets expectations for new users so they understand which phase they are responsible for and which they delegate.

## Acceptance criteria

- `sdd:init` output contains a "Two-phase workflow" (or equivalent) section
- The section names `/sdd:target-engage` as the intent-phase skill
- The section names `/sdd:spawn-sdd-worker` as the execution-phase skill
- The section distinguishes which phase the human is responsible for vs. which is delegated

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-004: sdd-init describes the two-phase workflow > SPEC-wf-004: contains a Two-phase workflow section` — init output documents the two-phase model
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-004: sdd-init describes the two-phase workflow > SPEC-wf-004: names /sdd:target-engage as the intent-phase skill` — the intent phase points at target-engage
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-004: sdd-init describes the two-phase workflow > SPEC-wf-004: names /sdd:spawn-sdd-worker as the execution-phase skill` — the execution phase points at spawn-sdd-worker

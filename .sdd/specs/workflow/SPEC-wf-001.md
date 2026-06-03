---
id: SPEC-wf-001
domain: workflow
abbrev: wf
status: active
aliases: []
version: "f2254dd6"
---

# SPEC-wf-001 — SDD has two phases: intent (human+Claude) and execution (sdd-worker)

## Invariant

The SDD pipeline splits into two phases with different actors. The **intent phase** (human + Claude) covers target creation, `/sdd:target-engage`, and spec reconciliation — it requires judgment and human sign-off and is never delegated to an automated agent. The **execution phase** (sdd-worker) covers `sdd:spec-audit`, `sdd:gap-to-work-items`, and `sdd:work-item-close` — it is deterministic given a clear spec and runs autonomously without human involvement.

## Acceptance criteria

- Intent-phase skills (`sdd:target-engage`, spec reconciliation) are never invoked by an automated agent
- sdd-worker only invokes execution-phase skills (`sdd:spec-audit`, `sdd:gap-to-work-items`, `sdd:work-item-close`)
- Human sign-off is required before any spec change reaches the execution phase

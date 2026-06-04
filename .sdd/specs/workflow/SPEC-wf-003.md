---
id: SPEC-wf-003
domain: workflow
abbrev: wf
status: active
aliases: []
version: "e3702926"
---

# SPEC-wf-003 — sdd:session-start next-action footer references sdd-worker for execution work

## Invariant

When `sdd:session-start` detects open gaps or pending/blocked work items, the next-action footer suggests `/sdd:spawn-sdd-worker {domain}` rather than the individual pipeline skills (`/sdd:spec-audit`, `/sdd:gap-to-work-items`, `/sdd:work-item-close`). If a worker is already running, the footer instructs the user to send the domain to the existing worker instead of spawning a new one.

## Acceptance criteria

- `session-start` footer with open gaps suggests `/sdd:spawn-sdd-worker {domain}`, not `/sdd:spec-audit`
- `session-start` footer with pending work items suggests `/sdd:spawn-sdd-worker {domain}`, not `/sdd:work-item-close`
- When sdd-worker is already active, footer instructs `SendMessage` to the existing worker instead of spawning

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-003: session-start footer references sdd-worker for execution work > SPEC-wf-003: open-gaps footer suggests /sdd:spawn-sdd-worker, not /sdd:spec-audit` — the open-gaps footer delegates to the worker
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-003: session-start footer references sdd-worker for execution work > SPEC-wf-003: pending/blocked work-items footer suggests /sdd:spawn-sdd-worker, not /sdd:work-item-close` — the pending-work-items footer delegates to the worker
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-003: session-start footer references sdd-worker for execution work > SPEC-wf-003: when a worker is already running, footer instructs SendMessage to the existing worker` — an active worker is reused rather than re-spawned

---
id: SPEC-wf-006
domain: workflow
abbrev: wf
status: active
aliases: []
version: "9b495bc7"
---

# SPEC-wf-006 — sdd-worker prompt defines role, responsibilities, and gap reporting

## Invariant

The prompt passed to the sdd-worker by `sdd:spawn-sdd-worker` must open with an explicit role declaration: the worker is a pure execution agent responsible for running `sdd:spec-audit`, `sdd:gap-to-work-items`, and `sdd:work-item-close` in sequence for the assigned domain. It does not engage targets, reconcile specs, or run intent-phase skills such as `sdd:session-start` or `sdd:target-engage`. If there is nothing to execute (no new spec items, no open gaps, no pending work items), it sends a "nothing to do" message to the team lead and shuts down rather than looking for work. After completing `sdd:spec-audit`, the worker sends a message to the team lead listing every gap found (IDs and locations) before proceeding to `sdd:gap-to-work-items`. The worker continues autonomously after reporting — lead approval is not required.

## Acceptance criteria

- Worker prompt opens with an explicit role declaration identifying it as a pure execution agent
- Worker prompt lists which intent-phase skills are prohibited (`sdd:session-start`, `sdd:target-engage`)
- Worker sends a "nothing to do" message to team lead and stops when no gaps or work items exist
- Worker sends gap report to team lead after `sdd:spec-audit` completes, before proceeding to `sdd:gap-to-work-items`
- Worker proceeds to `sdd:gap-to-work-items` autonomously without waiting for lead approval

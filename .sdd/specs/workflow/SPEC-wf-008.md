---
id: SPEC-wf-008
domain: workflow
abbrev: wf
status: active
aliases: []
version: "13849c8d"
---

# SPEC-wf-008 — Every pipeline skill output ends with a concrete next-step footer

## Invariant

Each SDD skill that represents a pipeline stage must end its output with a `---` divider followed by a single next-step sentence in the form: `Next: {sentence}. Run \`/{command} {arg}\` to proceed.` The suggestion must be conditional on the outcome (different when work was found vs. nothing found) and include the exact command with domain or artifact ID substituted. Required footers per skill: `sdd:session-start` — highest-priority action or "All clear"; `sdd:target-engage` — after accepting: "Run `/sdd:spec-audit {domain}`"; `sdd:spec-audit` — gaps found: "Run `/sdd:gap-to-work-items {domain}`", none found: "Run `/sdd:spec-test {domain}`"; `sdd:gap-to-work-items` — "Run `/sdd:work-item-close {first-id}`"; `sdd:work-item-close` — items remain: next WI id, all closed: "Run `/sdd:spec-audit {domain}` to verify"; `sdd:spec-test` — "Run the test suite then `/sdd:session-start`"; `sdd:spawn-sdd-worker` — "Worker running. You will be notified on completion."

## Acceptance criteria

- Every listed pipeline skill ends its output with a `---` divider and a `Next:` line
- The footer command is conditional on outcome (different suggestions for "work found" vs. "nothing found")
- The footer substitutes the actual domain name or artifact ID, not a placeholder
- `sdd:spec-audit` footer uses `gap-to-work-items` when gaps found, `spec-test` when none found
- `sdd:work-item-close` footer uses next WI ID when items remain, `spec-audit` to verify when all closed
- `sdd:spawn-sdd-worker` footer reads: "Worker running. You will be notified on completion."

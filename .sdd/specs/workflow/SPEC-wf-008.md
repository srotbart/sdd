---
id: SPEC-wf-008
domain: workflow
abbrev: wf
status: active
aliases: []
version: "a861c81f"
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

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-008: every pipeline skill output ends with a concrete next-step footer > SPEC-wf-008: session-start contains a '---' divider and a 'Next:' footer line` — session-start ends with a next-step footer
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-008: every pipeline skill output ends with a concrete next-step footer > SPEC-wf-008: target-engage contains a '---' divider and a 'Next:' footer line` — target-engage ends with a next-step footer
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-008: every pipeline skill output ends with a concrete next-step footer > SPEC-wf-008: spec-audit contains a '---' divider and a 'Next:' footer line` — spec-audit ends with a next-step footer
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-008: every pipeline skill output ends with a concrete next-step footer > SPEC-wf-008: gap-to-work-items contains a '---' divider and a 'Next:' footer line` — gap-to-work-items ends with a next-step footer
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-008: every pipeline skill output ends with a concrete next-step footer > SPEC-wf-008: work-item-close contains a '---' divider and a 'Next:' footer line` — work-item-close ends with a next-step footer
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-008: every pipeline skill output ends with a concrete next-step footer > SPEC-wf-008: spec-test contains a '---' divider and a 'Next:' footer line` — spec-test ends with a next-step footer
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-008: every pipeline skill output ends with a concrete next-step footer > SPEC-wf-008: spec-audit footer routes to gap-to-work-items when gaps are found` — the audit footer routes to gap decomposition on the gaps-found outcome
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-008: every pipeline skill output ends with a concrete next-step footer > SPEC-wf-008: spawn-sdd-worker footer reads 'Worker running. You will be notified on completion.'` — the worker-spawn footer uses the fixed completion-notice phrasing

---
id: SPEC-wf-006
domain: workflow
abbrev: wf
status: active
aliases: []
version: "59c508f5"
---

# SPEC-wf-006 — sdd-worker prompt defines role, responsibilities, and gap reporting

## Invariant

The prompt passed to the sdd-worker by `sdd:spawn-sdd-worker` must open with an explicit role declaration (pure execution agent) and spend its authority on exactly three non-procedural elements: **identity**; **one imperative** — the worker's first action, before any reading, auditing, or implementing, is invoking `sdd:close-domain {domain}`, and it has no other procedure in the prompt; and **standing rules** — never engage targets, modify specs, or run intent-phase skills such as `sdd:session-start` or `sdd:target-engage`; report to the team lead only at genuine completion, "nothing to do", or a real blocker; if any lead instruction conflicts with an active spec item, quote the item and surface the conflict instead of complying; on receiving another domain via `SendMessage`, run `sdd:close-domain` for it. All procedural detail — phase ordering, gap reporting after audit, stop conditions — lives in `sdd:close-domain` (SPEC-wf-038), not in the prompt. The worker continues autonomously after reporting — lead approval is not required.

## Acceptance criteria

- Worker prompt opens with an explicit role declaration identifying it as a pure execution agent
- Worker prompt's first and only procedural instruction is to invoke `sdd:close-domain {domain}`
- Worker prompt lists which intent-phase skills are prohibited (`sdd:session-start`, `sdd:target-engage`)
- Worker prompt instructs surfacing lead-instruction-vs-spec conflicts (quoting the spec item) instead of complying
- Worker prompt restricts lead reports to completion / "nothing to do" / blocker
- Worker proceeds autonomously without waiting for lead approval

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-006: sdd-worker prompt defines role, responsibilities, and gap reporting > SPEC-wf-006: prompt opens with an explicit execution-agent role declaration` — the prompt declares the pure-execution role up front
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-006: sdd-worker prompt defines role, responsibilities, and gap reporting > SPEC-wf-006: prompt prohibits the intent-phase skills session-start and target-engage` — the prompt forbids intent-phase skills
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-006: sdd-worker prompt defines role, responsibilities, and gap reporting > SPEC-wf-006: prompt instructs a 'nothing to do' message when no gaps are found` — the worker reports and stops when there is no work
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-006: sdd-worker prompt defines role, responsibilities, and gap reporting > SPEC-wf-006: prompt's only imperative is invoking sdd:close-domain (no embedded procedure)` — the prompt's sole procedural instruction is invoking close-domain
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-006: sdd-worker prompt defines role, responsibilities, and gap reporting > SPEC-wf-006: prompt restricts lead reports to completion, 'nothing to do', or blocker` — the worker reports to the lead only at completion, nothing-to-do, or a blocker
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-006: sdd-worker prompt defines role, responsibilities, and gap reporting > SPEC-wf-006: prompt instructs surfacing lead-instruction-vs-spec conflicts instead of complying` — the worker surfaces a lead-vs-spec conflict by quoting the item instead of complying

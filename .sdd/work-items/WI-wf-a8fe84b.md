---
id: WI-wf-a8fe84b
gap-id:
  - GAP-wf-737407e
  - GAP-wf-04d61f5
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Reduce the spawn-sdd-worker prompt to the close-domain shape

Many-to-one: GAP-wf-737407e (SPEC-wf-002) and GAP-wf-04d61f5 (SPEC-wf-006) are both fixed by the single rewrite of the worker prompt template in `spawn-sdd-worker/SKILL.md`.

**Scope:** `plugin/skills/spawn-sdd-worker/SKILL.md` (prompt template ~lines 56-87) — replace the embedded three-step procedure with the reduced shape: **identity** (sdd-worker, pure execution agent for `{project_root}`); **one imperative** — first action, before any reading/auditing/implementing, is to invoke `sdd:close-domain {domain}`, with no other procedure; **standing rules** — never engage targets, modify specs, or run intent-phase skills (`sdd:session-start`, `sdd:target-engage`); report to the lead only at completion / "nothing to do" / blocker; if any lead instruction conflicts with an active spec item, quote the item and surface the conflict instead of complying; on receiving another domain via `SendMessage`, run `sdd:close-domain` for it. Keep `model: sonnet`. Update the confirmation/report text (step 3) to reflect close-domain. Also update `hub/server/spec-wf-plugin.test.ts` SPEC-wf-002/006 assertions from the old three-step sequence to the new close-domain-first shape. Depends on WI-wf-e73d89c (close-domain exists).

**Acceptance criteria:**
- The worker prompt opens with an explicit pure-execution-agent role declaration
- The prompt's first and only procedural instruction is to invoke `sdd:close-domain {domain}`; no audit/decompose/close steps remain in the prompt
- The prompt lists prohibited intent-phase skills (`sdd:session-start`, `sdd:target-engage`), restricts lead reports to completion / "nothing to do" / blocker, and instructs surfacing lead-vs-spec conflicts by quoting the spec item
- The prompt documents reuse via `SendMessage` for additional domains (running close-domain for each) without re-spawning; `model` stays `sonnet`
- `hub/server/spec-wf-plugin.test.ts` SPEC-wf-002/006 tests are updated to assert the close-domain-first shape and pass
- Test: `npm run spec-report` (or the targeted `spec-wf-plugin.test.ts` run) is green for SPEC-wf-002 and SPEC-wf-006 under the amended assertions

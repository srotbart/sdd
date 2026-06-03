---
id: GAP-wf-014
spec-item: SPEC-wf-008
domain: workflow
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "13386e51"
closed-by: WI-wf-014
deferred-reason: null
---

# Gap: Pipeline skill footers missing "Next:" prefix and spawn-sdd-worker footer text differs from spec

**Locations:**
- `plugin/skills/session-start/SKILL.md:130` — footer example uses bare sentence with no `Next:` prefix
- `plugin/skills/spec-audit/SKILL.md:136` — footer example uses bare `Run /sdd:gap-to-work-items` with no `Next:` prefix
- `plugin/skills/gap-to-work-items/SKILL.md:94` — footer example uses bare sentence with no `Next:` prefix
- `plugin/skills/work-item-close/SKILL.md:103` — footer example hardcodes `Run /sdd:session-start` instead of the conditional footer; no `Next:` prefix
- `plugin/skills/spec-test/SKILL.md:145` — conditional footer descriptions at lines 152-153 have no `Next:` prefix
- `plugin/skills/spawn-sdd-worker/SKILL.md:104` — footer says "You will be notified when the worker completes or hits a blocker" vs spec-required "Worker running. You will be notified on completion."

**Reasoning:** SPEC-wf-008 requires all pipeline skill footers to use `Next: {sentence}. Run \`/{command} {arg}\` to proceed.` format after a `---` divider, but five skills (session-start, spec-audit, gap-to-work-items, work-item-close, spec-test) use bare sentences without the `Next:` prefix, and spawn-sdd-worker uses different wording than the spec mandates.

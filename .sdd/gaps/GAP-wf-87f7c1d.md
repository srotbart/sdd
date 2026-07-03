---
id: GAP-wf-87f7c1d
spec-item: SPEC-wf-030
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "ce76b5ad"
closed-by: WI-wf-f16b2a0
deferred-reason: null
---

# Gap: sdd-help walkthrough uses a legacy {seq} ID and omits the close-domain loop

**Locations:**
- `plugin/skills/sdd-help/SKILL.md:47` — pipeline step 6 example uses the legacy `WI-auth-001` sequential ID; per SPEC-wf-037 ephemeral IDs now mint `{7hex}` (both forms valid, but the walkthrough should show the current form).
- `plugin/skills/sdd-help/SKILL.md:39` — the walkthrough presents steps 4–6 (audit → decompose → close) with no close-domain one-shot alternative that drives 4–6 in a single loop.

**Reasoning:** SPEC-wf-030 names `sdd-help` as sharing the single source of truth for the pipeline model; its walkthrough diverges from the current model by omitting the close-domain loop and illustrating a legacy ID form.

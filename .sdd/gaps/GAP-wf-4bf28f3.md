---
id: GAP-wf-4bf28f3
spec-item: SPEC-wf-030
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "ce76b5ad"
closed-by: WI-wf-5a18bca
deferred-reason: null
---

# Gap: sdd-pipeline.md pipeline model predates the close-domain worker-v2 loop

**Locations:**
- `plugin/references/sdd-pipeline.md:8` — the pipeline-stages diagram ends at `work-item-close` / "Terminal", with no close-domain loop (orient → audit → decompose → close → guardian audit), no worker handoff, and no guardian audit.
- `plugin/references/sdd-pipeline.md:28` — the skill-responsibilities table lists only 6 skills; missing `close-domain`, `spawn-sdd-worker`, `spec-test`, `review-issues`, `review-improvements`, `review-engage`.
- `plugin/references/sdd-pipeline.md:37` — the Key-invariants list omits the local-only ephemeral archives (SPEC-wf-035) and hash-ID minting (SPEC-wf-037) facts.

**Reasoning:** SPEC-wf-030 requires the pipeline model to share a single source of truth (with sdd-help and the guides) rather than a divergent copy; this reference presents a pre-worker-v2 model that diverges from the current close-domain-driven loop.

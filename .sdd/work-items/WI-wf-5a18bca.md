---
id: WI-wf-5a18bca
gap-id: GAP-wf-4bf28f3
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Update sdd-pipeline.md to the worker-v2 / close-domain model

**Scope:** `plugin/references/sdd-pipeline.md` — (a) extend the pipeline-stages diagram to show the close-domain loop (orient → audit → decompose → close → guardian audit) and the spawn-sdd-worker handoff; (b) add rows to the skill-responsibilities table for `close-domain`, `spawn-sdd-worker`, `spec-test`, `review-issues`, `review-improvements`, `review-engage`; (c) add Key-invariants lines for local-only ephemeral archives (SPEC-wf-035) and hash-ID minting (SPEC-wf-037). Documentation only — no skill behavior change.

**Acceptance criteria:**
- The diagram shows the close-domain loop phases and the worker handoff / guardian audit
- The skill-responsibilities table includes close-domain, spawn-sdd-worker, spec-test, review-issues, review-improvements, review-engage
- The Key-invariants section states ephemeral archives are local-only/gitignored and ephemeral IDs are minted `{7hex}`
- Verify: `node plugin/scripts/check-artifact-guides.js` and `check-skills-drift.js` still exit 0 (doc unaffected by them, sanity)

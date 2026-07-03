---
id: WI-wf-f7bf4e6
gap-id: GAP-wf-2d78ddc
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Correct the PluginReference artifact model (archive, IDs, ISS/IMP)

**Scope:** `hub/client/src/screens/PluginReference.tsx` and its co-located test — (a) fix the SPEC artifact-card desc and the DESIGN_DECISIONS line so they no longer claim specs are "never archived": active specs are durable; deprecated/aliased items move to the tracked spec archive (SPEC-wf-035); (b) show `{7hex}` IDs in GAP_SCHEMA / WI_SCHEMA (note both `{seq}` and `{7hex}` are valid, SPEC-wf-037); (c) add ISS (Issue) and IMP (Improvement) cards to ARTIFACTS and rows to LIFECYCLE_ROWS (SPEC-wf-025/026). Update `PluginReference.test.tsx` to cover the new cards and corrected wording. UI/doc alignment only — no behavior change.

**Acceptance criteria:**
- Neither the SPEC card nor DESIGN_DECISIONS asserts specs are "never archived"; the tracked spec-archive nuance is reflected
- GAP_SCHEMA and WI_SCHEMA use `{7hex}` example IDs (both forms noted as valid)
- ARTIFACTS includes Issue (ISS, `.sdd/issues/`) and Improvement (IMP, `.sdd/improvements/`) cards; LIFECYCLE_ROWS includes their lifecycles
- Test: `PluginReference.test.tsx` asserts the ISS and IMP cards render and that the archive wording is corrected (no "never archived")
- Verify: the client vitest suite for PluginReference passes on Node 22

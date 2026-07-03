---
id: GAP-wf-2af215e
spec-item: SPEC-wf-037
domain: workflow
status: closed
discovered: "2026-07-03T02:29:42Z"
audit-spec-version: "fe5b4d86"
closed-by: WI-wf-1744ccd
deferred-reason: null
---

# Gap: Consumers and docs assert only the sequential {seq} suffix, omitting the {7hex} form and TGT history-scan

**Locations:**
- `hub/server/spec-wf-plugin.test.ts:366` — asserts `review-issues` skill text matches literal `ISS-{domain}-{seq}`
- `hub/server/spec-wf-plugin.test.ts:396` — asserts `review-improvements` skill text matches literal `IMP-{domain}-{seq}`
- `plugin/skills/session-start/SKILL.md:100` — ID-conventions block lists only `{seq}` forms; no `{7hex}` guidance, no TGT active-plus-history derivation, no duplicate-ID warning
- `plugin/references/schemas.md:272-283` — ID conventions summary documents sequential suffixes only; no hash form, no local-only archive semantics

**Reasoning:** These consumers/docs recognise only the `{seq}` suffix (the two spec-wf-plugin tests would fail once the minting skills emit `{7hex}` text), so the "every consumer accepts both suffix forms" requirement of SPEC-wf-037 is unmet — the hub `ARTIFACT_ID_RE` in `hub/client/src/components/Markdown.tsx:29` already accepts both and correctly holds.

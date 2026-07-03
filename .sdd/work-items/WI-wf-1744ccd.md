---
id: WI-wf-1744ccd
gap-id: GAP-wf-2af215e
domain: workflow
status: done
created: "2026-07-03T02:31:16Z"
abandoned-reason: null
---

# Work Item: Make consumers and docs accept both {seq} and {7hex} ID suffix forms

**Scope:** `hub/server/spec-wf-plugin.test.ts:366,396`, `plugin/skills/session-start/SKILL.md:100`, `plugin/references/schemas.md` — widen the ISS/IMP shape assertions to accept both `{seq}` and `{7hex}` suffixes, update session-start ID guidance to document the hash form (and TGT active-plus-history derivation + duplicate-ID warning), and document both ID forms plus local-only archive semantics in schemas.md.

**Note:** Close this work item BEFORE WI-wf-dc57a5a (hash minting) — the widened test assertions must accept both forms before the minting skills switch their text to `{7hex}`, so the suite stays green through the transition.

**Acceptance criteria:**
- `spec-wf-plugin.test.ts` ISS/IMP shape assertions match both `ISS-{domain}-{seq}`/`ISS-{domain}-{7hex}` and `IMP-{domain}-{seq}`/`IMP-{domain}-{7hex}` (regex passes on current `{seq}` skill text and on future `{7hex}` text)
- session-start ID-conventions block documents the `{7hex}` ephemeral form, TGT active-plus-history derivation, and a duplicate-ID warning
- `schemas.md` documents both suffix forms and the local-only ephemeral-archive semantics
- Test: `npm run spec-report` (hub) passes with the widened assertions

---
id: WI-wf-b5f3610
gap-id: GAP-wf-4d2b706
domain: workflow
status: pending
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add SPEC-wf-* lint check + update impacted spec tests

**Scope:** `plugin/scripts/lint-check.sh` and `hub/server/spec-wf-plugin.test.ts` — (a) add a check to lint-check.sh that fails when any `SPEC-wf-[0-9]` citation appears under plugin/ (using the `[0-9]` suffix so the grep pattern doesn't match itself); (b) update 2 existing test assertions in spec-wf-plugin.test.ts that grep schemas.md and artifacts/spec.md for the literal string "SPEC-wf-042" — replace with behavior-phrase assertions; (c) add a SPEC-wf-043 describe block with a probe-based test that verifies lint-check.sh fails when a plugin SKILL.md contains a SPEC-wf-NNN citation

**Acceptance criteria:**
- `lint-check.sh` contains a check that greps plugin/ for `SPEC-wf-[0-9]` and calls `fail` when matches are found
- The check message identifies this as a self-containedness violation
- The two existing tests in spec-wf-plugin.test.ts (`schemas.md … SPEC-wf-042` and `spec artifact guide … SPEC-wf-042`) no longer assert `/SPEC-wf-042/` against plugin files; they assert a behavior phrase instead (e.g., the text explains scope is authoritative for close-domain / guardian audit selection)
- A new `SPEC-wf-043` describe block exists with a probe-based test: write a SKILL.md stub with a SPEC-wf-NNN ID into a temporary skill directory under plugin/, run lint-check.sh, assert it fails with a SPEC-wf self-containedness message, clean up in finally
- All existing tests pass; new tests pass

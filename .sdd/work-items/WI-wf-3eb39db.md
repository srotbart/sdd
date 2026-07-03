---
id: WI-wf-3eb39db
gap-id: GAP-wf-4d2b706
domain: workflow
status: pending
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Remove SPEC-wf-* citations from plugin/references/artifacts/

**Scope:** `plugin/references/artifacts/spec.md` (2 citations at lines 25, 30), `plugin/references/artifacts/target.md` (2 citations at lines 109, 112), `plugin/references/artifacts/work-item.md` (3 citations at lines 95, 99, 125) — replace every `(SPEC-wf-NNN)` parenthetical with inline prose

**Acceptance criteria:**
- None of the three files contains any match for `SPEC-wf-[0-9]`
- Each removed citation's rule is stated inline: commit-before-mv ordering (formerly SPEC-wf-036), ephemeral archive gitignore (formerly SPEC-wf-035), scope field path-glob semantics (formerly SPEC-wf-042 in spec.md)
- Existing SPEC-wf-036 artifact-guide tests (→ commit → `mv`, never stage archive) continue to pass

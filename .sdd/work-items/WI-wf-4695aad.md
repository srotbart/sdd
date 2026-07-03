---
id: WI-wf-4695aad
gap-id: GAP-wf-4d2b706
domain: workflow
status: pending
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Remove SPEC-wf-* citations from plugin/references/schemas.md and sdd-pipeline.md

**Scope:** `plugin/references/schemas.md` (6 citations at lines 23, 24, 105, 152, 162, 305) and `plugin/references/sdd-pipeline.md` (3 citations at lines 20, 66, 70) — replace every `(SPEC-wf-NNN)` parenthetical with inline prose stating the rule

**Acceptance criteria:**
- Neither file contains any match for `SPEC-wf-[0-9]`
- Each removed citation's normative content is preserved inline at its former location (e.g. "ephemeral archive directories are gitignored local-only caches" replaces "(SPEC-wf-035)")
- Existing tests that read these files and assert behavioral content (opt-in, recall-oriented, path glob, local-only cache, etc.) continue to pass

---
id: SPEC-wf-037
domain: workflow
abbrev: wf
status: active
aliases: []
version: "6c6b60f8"
---

# SPEC-wf-037 — Ephemeral artifacts mint collision-free hash IDs; sequential types scan history

## Invariant

Newly created ephemeral artifacts — gaps, work-items, issues, improvements — mint IDs of the form `{PREFIX}-{abbrev}-{7hex}` (7 lowercase hex characters, randomly generated at creation, e.g. `GAP-wf-3f9c2a1`). Minting requires no lookup, no coordination, and is safe in parallel worktrees; IDs are never recycled by construction. Targets and specs keep sequential IDs (`TGT-{seq}`, `SPEC-{abbrev}-{seq}`); because target archives are untracked (SPEC-wf-035), the next TGT sequence number is derived from active target files **plus** a git-history scan (`git log --diff-filter=A --name-only -- .sdd/targets/`), which requires a full (non-shallow) clone. Existing sequential IDs of any type are never renamed, and every consumer — skills, hub ID auto-linking, spec test-status mapping — accepts both suffix forms (`{seq}` and `{7hex}`).

## Acceptance criteria

- Minting skills (spec-audit, gap-to-work-items, review-issues, review-improvements) generate `{PREFIX}-{abbrev}-{7hex}` IDs for new artifacts
- Two artifacts minted independently (e.g. in parallel worktrees) cannot receive the same ID without astronomical odds; no max-seq scan is performed for ephemeral types
- Target creation derives the next `TGT-{seq}` from active files plus git history, never from archive directory contents
- Hub auto-linking matches both suffix forms (verified: `ARTIFACT_ID_RE` in `hub/client/src/components/Markdown.tsx` already accepts alphanumeric segments)
- No existing artifact is renamed to the new convention

**Tests:**
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: consumers and docs accept both {seq} and {7hex} ID suffix forms > SPEC-wf-037: session-start documents the {7hex} form, TGT history-scan, and duplicate-ID warning` — session-start documents hash IDs and the target history scan
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: consumers and docs accept both {seq} and {7hex} ID suffix forms > SPEC-wf-037: schemas.md documents both suffix forms and local-only archive semantics` — the schema reference covers both ID suffix forms
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: consumers and docs accept both {seq} and {7hex} ID suffix forms > SPEC-wf-037: hub ARTIFACT_ID_RE matches both sequential and 7-hex suffix forms` — hub ID auto-linking accepts sequential and hash IDs
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: ephemeral minting skills mint {7hex} hash IDs, not archive-scanned {seq} > SPEC-wf-037: spec-audit mints the {7hex} hash form` — spec-audit mints hash gap IDs
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: ephemeral minting skills mint {7hex} hash IDs, not archive-scanned {seq} > SPEC-wf-037: spec-audit no longer instructs an archive/sequence scan for minting` — spec-audit does not scan archives to mint IDs
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: ephemeral minting skills mint {7hex} hash IDs, not archive-scanned {seq} > SPEC-wf-037: gap-to-work-items mints the {7hex} hash form` — gap-to-work-items mints hash work-item IDs
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: ephemeral minting skills mint {7hex} hash IDs, not archive-scanned {seq} > SPEC-wf-037: gap-to-work-items no longer instructs an archive/sequence scan for minting` — gap-to-work-items does not scan archives to mint IDs
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: ephemeral minting skills mint {7hex} hash IDs, not archive-scanned {seq} > SPEC-wf-037: review-issues mints the {7hex} hash form` — review-issues mints hash issue IDs
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: ephemeral minting skills mint {7hex} hash IDs, not archive-scanned {seq} > SPEC-wf-037: review-issues no longer instructs an archive/sequence scan for minting` — review-issues does not scan archives to mint IDs
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: ephemeral minting skills mint {7hex} hash IDs, not archive-scanned {seq} > SPEC-wf-037: review-improvements mints the {7hex} hash form` — review-improvements mints hash improvement IDs
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-037: ephemeral minting skills mint {7hex} hash IDs, not archive-scanned {seq} > SPEC-wf-037: review-improvements no longer instructs an archive/sequence scan for minting` — review-improvements does not scan archives to mint IDs

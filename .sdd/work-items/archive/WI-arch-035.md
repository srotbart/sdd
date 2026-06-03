---
id: WI-arch-035
gap-id: GAP-arch-038
domain: architecture
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Derive domain from spec-item when domain frontmatter is absent in parseGapFile

**Scope:** `hub/server/sdd-parser.ts:233` — in `parseGapFile`, when `meta["domain"]` is absent or empty, derive the domain from the `spec-item` value using the abbrev→domain mapping: `arch→architecture`, `scr→ui-screens`, `ui→ui-layout`, `uic→ui-components`, `wf→workflow`.

**Acceptance criteria:**
- `parseGapFile` returns a non-empty `domain` for gap files that have no `domain` frontmatter field
- The abbrev is extracted as the middle segment of the spec-item ID (e.g. `SPEC-scr-023` → `scr` → `ui-screens`)
- If the abbrev is unrecognised, the abbrev itself is used as the domain fallback
- `domain` is never returned as empty string from `parseGapFile`
- Unit test: gap file with no domain field and `spec-item: SPEC-arch-001` returns `domain: "architecture"`
- Unit test: gap file with no domain field and `spec-item: SPEC-scr-023` returns `domain: "ui-screens"`
- Unit test: gap file with an explicit domain field uses the explicit value unchanged

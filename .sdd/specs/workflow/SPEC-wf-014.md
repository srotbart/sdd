---
id: SPEC-wf-014
domain: workflow
abbrev: wf
status: active
aliases: []
version: "fb82af49"
---

# SPEC-wf-014 — Each spec item file carries its own domain metadata and per-item version hash

## Invariant

Per-item frontmatter fields: `id` (e.g. `SPEC-wf-013`), `domain` (e.g. `workflow`), `abbrev` (e.g. `wf`), `status` (`active` or `deprecated`), `aliases` (list of retired IDs), `version` (8-char SHA-256 prefix of the file's own content). The `version` field is updated by the writing skill immediately after any content change using `shasum -a 256 {file} | cut -c1-8`. There is no domain-level manifest file — domain identity is derived from the subdirectory name.

## Acceptance criteria

- Every spec item file has `id`, `domain`, `abbrev`, `status`, `aliases`, and `version` in its frontmatter
- The `version` field is an 8-char SHA-256 prefix of the file's content
- Writing skills recompute and update `version` immediately after any content change
- No domain-level manifest file exists; domain identity comes from the subdirectory name

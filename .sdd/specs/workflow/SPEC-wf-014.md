---
id: SPEC-wf-014
domain: workflow
abbrev: wf
status: active
aliases: []
version: "21117428"
---

# SPEC-wf-014 — Each spec item file carries its own domain metadata and per-item version hash

## Invariant

Per-item frontmatter fields: `id` (e.g. `SPEC-wf-013`), `domain` (e.g. `workflow`), `abbrev` (e.g. `wf`), `status` (`active` or `deprecated`), `aliases` (list of retired IDs), `version` (8-char SHA-256 prefix of the file's own content). The `version` field is updated by the writing skill immediately after any content change using `shasum -a 256 {file} | cut -c1-8`. There is no domain-level manifest file — domain identity is derived from the subdirectory name.

## Acceptance criteria

- Every spec item file has `id`, `domain`, `abbrev`, `status`, `aliases`, and `version` in its frontmatter
- The `version` field is an 8-char SHA-256 prefix of the file's content
- Writing skills recompute and update `version` immediately after any content change
- No domain-level manifest file exists; domain identity comes from the subdirectory name

**Tests:**

- `hub/server/spec-wf.test.ts > SPEC-wf-014: each spec item file carries its own domain metadata and per-item version hash > SPEC-wf-014: an item file carries its own version hash from frontmatter` — each item exposes its own version hash
- `hub/server/spec-wf.test.ts > SPEC-wf-014: each spec item file carries its own domain metadata and per-item version hash > SPEC-wf-014: domain identity comes from per-item frontmatter; two domains stay separate` — domain identity is per-item and keeps domains separate
- `hub/server/spec-wf.test.ts > SPEC-wf-014: each spec item file carries its own domain metadata and per-item version hash > SPEC-wf-014: an item file MISSING the domain frontmatter field is rejected (not silently grouped)` — an item without a domain field is rejected

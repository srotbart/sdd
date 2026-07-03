---
id: SPEC-wf-039
domain: workflow
abbrev: wf
status: active
aliases: []
version: "959d9781"
---

# SPEC-wf-039 — spec-index script builds a deterministic, ephemeral full-corpus index

## Invariant

A script `plugin/scripts/spec-index.js` builds the spec index mechanically: it globs `.sdd/specs/*/SPEC-*.md` and `.sdd/specs/*/*/SPEC-*.md` (skipping `archive/` at either level), parses each item's frontmatter and first heading, and prints one line per active item to stdout: `{id}\t{domain}\t{title}\t{scope globs, comma-separated or empty}`. The index is ephemeral — built on the fly, never committed to the repo (a persisted index is stale derived state). Agents never assemble the index by hand; determinism is the point. The item's title serves as its one-line description — there is no separate summary field, and titles are authored as declarative invariant statements.

## Acceptance criteria

- `plugin/scripts/spec-index.js` exists and prints one tab-separated line per active spec item (id, domain, title, scope globs)
- Items under `archive/` directories at either depth are excluded
- Items with `status:` other than `active` are excluded
- No index file is committed to the repo; the script writes only to stdout
- `sdd:close-domain` runs the script at Phase 0 and re-runs it at Phase 4 (mid-run spec changes covered by regeneration, not cache invalidation)

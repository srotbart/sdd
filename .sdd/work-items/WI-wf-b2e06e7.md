---
id: WI-wf-b2e06e7
gap-id: GAP-wf-61cf648
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create the spec-index.js script

**Scope:** `plugin/scripts/spec-index.js` (new) — a Node script (sibling of `check-*.js`) that globs `.sdd/specs/*/SPEC-*.md` and `.sdd/specs/*/*/SPEC-*.md`, skips `archive/` at either level, excludes items whose `status:` is not `active`, parses frontmatter and the first `#` heading, and prints one tab-separated line per active item to stdout: `{id}\t{domain}\t{title}\t{scope globs, comma-separated or empty}`. Writes only to stdout; no file is committed.

**Acceptance criteria:**
- `node plugin/scripts/spec-index.js` prints one tab-separated line per active spec item with fields id, domain, title, scope globs (empty field when no `scope:`)
- Items under `archive/` at either depth are excluded; non-`active` items are excluded
- The script writes only to stdout and commits no index file
- Test: running the script over the repo's specs emits a line for a known active item (e.g. SPEC-wf-038) and no line for an archived item (e.g. SPEC-wf-007)
- Test: an item carrying a `scope:` list has its globs rendered comma-separated in the 4th column; an item without `scope:` renders an empty 4th field

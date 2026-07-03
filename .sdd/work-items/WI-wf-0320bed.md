---
id: WI-wf-0320bed
gap-id: GAP-wf-8483a63
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Document the optional scope: frontmatter field

**Scope:** `plugin/references/schemas.md` (spec item frontmatter block ~line 98) and `plugin/references/artifacts/spec.md` (required-frontmatter block ~line 18) — add the optional `scope:` field: a list of repo-root-relative path glob patterns (minimatch/`.gitignore` syntax, e.g. `scope: [hub/client/src/**]`) naming the code areas the item governs. Document that it is opt-in for cross-cutting items, recall-oriented (broad globs are correct), authored at target-engage time, no backfill required, and that discovery + guardian audit treat a matching glob as authoritative candidate inclusion while absence means relevance is decided by reasoning. Depends on WI-wf-b2e06e7 (spec-index emits the scope column).

**Acceptance criteria:**
- `plugin/references/schemas.md` documents the optional `scope:` field with path-glob semantics in the spec frontmatter reference
- `plugin/references/artifacts/spec.md` documents the optional `scope:` field with path-glob semantics
- Docs state scope is opt-in, recall-oriented, requires no backfill, and is treated as authoritative candidate inclusion by discovery and guardian audit
- Test: a check (grep-style, matching this repo's `spec-wf-plugin.test.ts` pattern) asserts both files mention `scope:` with path-glob wording
- Test: `node plugin/scripts/spec-index.js` output includes scope globs for an item carrying `scope:` (verifies the index-emits-scope criterion of SPEC-wf-042)

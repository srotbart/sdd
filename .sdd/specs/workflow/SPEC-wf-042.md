---
id: SPEC-wf-042
domain: workflow
abbrev: wf
status: active
aliases: []
version: "171d5d99"
---

# SPEC-wf-042 — Spec items may declare an optional scope of governed code paths

## Invariant

Spec item frontmatter may carry an optional `scope:` field — a list of path glob patterns (minimatch/`.gitignore` syntax, repo-root-relative, e.g. `scope: [hub/client/src/**]`) naming the code areas the item governs. Scope globs are recall-oriented, not precision-oriented: a cross-cutting rule correctly carries a broad glob so it is always a candidate when that area changes; precision comes from the agent pruning candidates by title. `scope:` is opt-in for genuinely cross-cutting items, authored at target-engage time going forward — absence of `scope:` means relevance is decided by reasoning, never that the item is out of play. No backfill of existing items is required. Discovery (SPEC-wf-040) and the guardian audit (SPEC-wf-041) treat a matching scope glob as authoritative inclusion in the candidate set.

## Acceptance criteria

- The spec item schema (`references/schemas.md` and the spec artifact guide) documents the optional `scope:` frontmatter field with path-glob semantics
- The spec-index script includes scope globs in its output when present and an empty field when absent
- Discovery and guardian-audit procedures treat scope-glob matches as authoritative candidate inclusion
- Items without `scope:` remain fully in play via reasoning — no procedure treats absence as exclusion

**Tests:**
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-042: spec items may declare an optional scope of governed code paths > SPEC-wf-042: schemas.md documents the optional scope: field with path-glob semantics` — the schema reference documents the optional scope field
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-042: spec items may declare an optional scope of governed code paths > SPEC-wf-042: the spec artifact guide documents the optional scope: field with path-glob semantics` — the spec artifact guide documents the optional scope field
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-042: spec items may declare an optional scope of governed code paths > SPEC-wf-042: docs state scope is opt-in, recall-oriented, no-backfill, and authoritative inclusion` — the docs state the scope field's opt-in, recall-oriented semantics
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-042: spec items may declare an optional scope of governed code paths > SPEC-wf-042: spec-index emits scope globs for an item carrying scope:` — the spec-index surfaces scope globs for a scoped item

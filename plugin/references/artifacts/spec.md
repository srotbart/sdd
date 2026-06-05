# Spec Artifact Guide

The **spec item** is the durable source of truth in SDD. It is a single canonical
invariant — a statement of what must be true. Spec items are authored by the agent
(from accepted targets) and are never deleted; they archive only when replaced or
deprecated. All other artifacts (gaps, work items) reference spec items by ID.

---

## 1. Schema / ID Convention

**File path:** `.sdd/specs/{domain}/SPEC-{abbrev}-{seq}.md`
**ID pattern:** `SPEC-{abbrev}-{seq}` — abbreviation is the domain shorthand
(e.g., `auth`, `wf`, `api`); sequence is globally stable within the domain.

**Required frontmatter:**

```markdown
---
id: SPEC-auth-001
domain: authentication
abbrev: auth
status: active        # active | deprecated | aliased
aliases: []           # former IDs, populated by spec-collapse
version: "a3f9c812"  # SHA-256[:8] of the file's own content; recompute on every write
---
```

**Required body sections (in order):**

```markdown
# SPEC-auth-001 — <Title>

## Invariant

<Concise statement of what must be true. One authoritative rule.>

## Acceptance criteria

- <Bullet 1: verifiable condition>
- <Bullet 2: verifiable condition>

**Tests:**   ← optional; added by spec-test skill
- `tests/...::test_SPEC_auth_001_...` — "behavior description"
```

---

## 2. Lifecycle

Spec items are **durable** — they do not move to `archive/` while active.
Removed or obsolete items move to `.sdd/specs/{domain}/archive/`.

```
active → deprecated → [archive]
active → aliased    → [archive]   (merged into another item by spec-collapse)
```

| State | Meaning |
|---|---|
| `active` | Live invariant; enforced by spec-audit |
| `deprecated` | Superseded; no longer audited; moves to archive |
| `aliased` | Merged into another item; `aliases` field on the new item lists this ID |

---

## 3. Valid State Transitions

| From | To | Who | Trigger |
|---|---|---|---|
| `active` | `deprecated` | Agent | Superseded by a new/modified item |
| `active` | `aliased` | Agent (spec-collapse) | Merged into another item |
| `deprecated` | archived (file moved) | Agent | After deprecation is confirmed |
| `aliased` | archived (file moved) | Agent | After alias is set on new item |

**Spec items are never deleted outright.** Deprecated/aliased items move to
`archive/`, preserving provenance for any gaps that still reference them.

---

## 4. Operating Procedure

### Writing a new spec item

1. Determine the domain subdirectory: `.sdd/specs/{domain}/`.
   Create it if this is the first item for the domain.
2. Assign the next sequential ID: `SPEC-{abbrev}-{next-seq}`.
3. Write the file with all required frontmatter and body sections.
4. Compute the version hash and set it in frontmatter:
   ```bash
   shasum -a 256 .sdd/specs/{domain}/SPEC-{abbrev}-{seq}.md | cut -c1-8
   ```
   On Windows: `certutil -hashfile <file> SHA256 | head -2 | tail -1 | cut -c1-8`
   or use the Node helper in `plugin/scripts/`.
5. The file is now the source of truth for this invariant.

### Updating a spec item

1. Edit the body (invariant, acceptance criteria, tests block) as needed.
2. **Recompute and update the `version` field** after every write.
   Failure to recompute leaves stale gaps undetectable.
3. All open gaps referencing this item become stale (detectable by comparing
   `audit-spec-version` on the gap vs `version` on the spec item).

### Deprecating or aliasing

Use `spec-collapse` skill for structural cleanup — never manually rename or
renumber spec items. Set `status: deprecated` or `status: aliased`, populate
`aliases` on the new item, and move the file to `archive/`.

---

## 5. Invariants and Discipline

- **Specs are the source of truth.** All other artifacts reference spec item IDs.
- **Version recomputation on every write.** The `version` field must be updated
  every time the file is written; stale versions cause false "all-clear" stale checks.
- **One invariant per item.** If a spec item states two independent rules,
  split it into two items. Compound invariants make gaps ambiguous.
- **`## Invariant` and `## Acceptance criteria` sections are mandatory** in every
  active spec item body. Audits reason against `## Invariant`; test coverage is
  assessed against `## Acceptance criteria`.
- **Stable IDs.** Spec item IDs are never recycled. If an item is removed,
  its ID is retired (not reassigned). Aliasing handles renames.
- **No domain-level manifest.** Domain metadata is in each item's frontmatter.
  The domain name is also derivable from the subdirectory name.

---

## 6. Edge Cases

**Version hash computation on Windows:** The `shasum` command is not available.
Use Node.js: `node -e "const c=require('fs').readFileSync(process.argv[1],'utf8');const h=require('crypto').createHash('sha256').update(c).digest('hex');console.log(h.slice(0,8))" <file>`
or use `certutil -hashfile <file> SHA256`.

**Stale gap detection:** When `audit-spec-version` on a gap does not match the
current `version` on the spec item, the gap is stale — re-run spec-audit before
acting on it.

**Alias resolution:** When a gap references a deprecated/aliased spec item ID,
the valid item is found by scanning `aliases` fields on active items. No migration
of existing gaps is required.

**Spec items with no tests block:** Items without a `**Tests:**` block are surfaced
by `session-start` as uncovered. This is a warning, not a hard error.

**Multiple domains:** Each domain has exactly one subdirectory under `.sdd/specs/`.
The abbreviation must be unique across all domains to avoid ID collisions.

---

## See Also

- `plugin/references/schemas.md` — ID conventions and cross-reference chain
- `plugin/references/sdd-pipeline.md` — full pipeline and skill responsibilities
- `plugin/skills/spec-audit/SKILL.md` — spec-audit operating skill
- `plugin/skills/target-engage/SKILL.md` — folds targets into spec items

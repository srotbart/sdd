# Spec Artifact Guide

The **spec item** is the durable source of truth in SDD. It is a single canonical
invariant — a statement of what must be true. Spec items are authored by the agent
(from accepted targets) and are never deleted; they archive only when replaced or
deprecated. All other artifacts (gaps, work items) reference spec items by ID.

Spec items are organized by **component** — a concrete unit of the system.
Components nest: a component may contain sub-components to any depth, and the
top-level components are called **areas** (coarse regions of the system, e.g.
`hub`, `pipeline`). A spec item attaches to exactly one component: the directory
it sits in.

---

## 1. Schema / ID Convention

**File path:** `.sdd/specs/{component-path}/SPEC-{abbrev}-{seq}.md`, where
`{component-path}` is one or more nested component directories, e.g.
`hub/server/` or `hub/client/screens/`.
**ID pattern:** `SPEC-{abbrev}-{seq}` — abbreviation is the owning component's
shorthand (from its manifest, e.g. `hsrv`, `scr`); sequence is stable within
the component. **Abbreviations must be unique across all components.**

**Required frontmatter:**

```markdown
---
id: SPEC-scr-001
component: hub/client/screens   # full path from the specs root — must match the directory
abbrev: scr
status: active        # active | deprecated | aliased
aliases: []           # former IDs, populated by spec-collapse
scope: []             # optional; path globs of the code this item governs
version: "a3f9c812"  # SHA-256[:8] of the file with the version line stripped; recompute on every write
---
```

**Legacy `domain:` field:** older spec items carry `domain: {name}` +
`abbrev:` instead of `component:`. Readers MUST accept it, treating
`domain: x` as `component: x` (a one-level component tree). Writers use
`component:` only. The `migrate-components` skill converts a project.

**The component hierarchy:**

- **A spec item attaches to exactly one component** — its directory. An item
  placed at a non-leaf component governs that component's whole subtree (e.g. a
  rule for every screen lives in `hub/client/screens/`; a rule for one screen
  lives in `hub/client/screens/dashboard/`).
- The **area** is the first segment of the component path. It is derived,
  never stored in frontmatter.
- **Depth discipline:** any depth is valid, but start at two levels
  (`{area}/{component}`) and split a component into sub-components only when it
  accumulates enough items to need the structure. Splitting later is cheap:
  `git mv` the item files — IDs never change, references stay valid.
- **Reserved names:** `archive` is not a valid component name;
  `component.md` and `area.md` are manifest files, not spec items.

**Component manifest — `component.md`, one per component directory:**

```markdown
---
component: hub/client/screens    # full path — must match the directory
abbrev: scr                      # shorthand for NEW spec items minted here
scope:                           # path globs of the code this component owns
  - hub/client/src/screens/**
depends-on:                      # other components, full paths; may be empty
  - hub/server
---

# hub/client/screens

One paragraph: what this component is and where it lives in the codebase.
```

The manifest carries identity, code scope, and dependency edges — never a
member list (membership is the directory itself). Component `scope:` globs are
the shared file→component mapping; per-item `scope:` remains for items whose
reach differs from their component. An optional `area.md` at the top level
holds a description and display order for visualization.

**Optional per-item `scope:` field:** a list of **path glob patterns**
(minimatch/`.gitignore` syntax, repo-root-relative, e.g. `scope: [hub/client/src/**]`)
naming the code areas the item governs beyond (or instead of) its component's
scope. Path globs make the guardian audit's *changed file → candidate spec items*
mapping deterministic. It is **opt-in for genuinely cross-cutting items**,
authored at target-engage time; **no backfill** of existing items is required.
Globs are **recall-oriented**: a broad glob is correct for a cross-cutting rule so
it is always a candidate when that area changes; precision comes from pruning
candidates by title. Discovery and the guardian audit treat a matching scope glob
as **authoritative inclusion**; **absence of `scope:` means relevance is decided
by reasoning, never that the item is out of play.**

**File → candidate items mapping (guardian audit):** a changed file's candidate
spec items are those of the most-specific component whose scope matches the
file, **plus all ancestor components** (an ancestor's rules bind descendants by
definition), plus any item-level `scope:` glob hits anywhere in the tree.

**Contract items and bindings.** A **contract** is an invariant about how two
components interact — one component's promise, relied on by another (an API's
response shape, a message schema, a shared file format). Contracts are
inherently edges, so placement follows one convention: **the producer owns the
contract** — the item lives in the providing component, and the consumer is
declared in frontmatter. (Genuinely symmetric peer protocols may live at the
two components' lowest common ancestor instead.)

A contract item carries a **binding**: the consumer path plus a hash stamp of
every endpoint spec item at the time the contract was last verified in sync:

```markdown
---
id: SPEC-hsrv-012
component: hub/server              # the producer — the item lives here
...
contract-consumer: hub/client
contract-synced: [SPEC-hsrv-020@a3f9c812, SPEC-hcli-004@9921bc0d]
---
```

Each `contract-synced` entry is `{spec-item-id}@{version-hash}` and references
the **other** spec items forming the contract's endpoints. **Never stamp the
contract item itself** — a self-stamp is mathematically unable to converge
(writing the stamp changes the file, which changes the hash the stamp would
need to record). The contract item's own edits need no stamp: editing the
promise *is* the re-verification event, and the re-stamp of the other
endpoints happens in that same write. Readers ignore self-stamps; sdd-doctor
flags them as malformed.

**Binding status is derived, never stored** — compare each stamp against the
referenced item's current `version`:

- all match → **in-sync**
- a producer-side item drifted → **producer-drifted**; a consumer-side item
  drifted → **consumer-drifted** (side = whether the drifted item's component
  sits under the contract's component or under `contract-consumer`). A
  definite drift always outranks an unknown — every entry is checked before
  the status is decided.
- a referenced item can't be found → **unknown** (surfaced, never guessed)
- zero usable entries (empty or all-malformed `contract-synced`) → **unknown**
  — an unverified binding is never reported in-sync

**Re-syncing:** when an edge drifts, re-verify the contract against both sides
(does the promise still hold as stated?), update the invariant if needed, then
re-stamp `contract-synced` with the current hashes and recompute `version`.
Re-stamping without re-verifying defeats the mechanism. Drift is *detection*,
not violation — the audit decides whether anything is actually broken.

Consumers of the mechanism: the hub colors Map edges by binding status,
`session-start` lists drifted bindings next to stale-audit warnings, and
`sdd-doctor` reports drifted or malformed bindings (report-only — re-stamping
requires verification, which is the worker's job).

**Required body sections (in order):**

```markdown
# SPEC-scr-001 — <Title>

## Invariant

<Concise statement of what must be true. One authoritative rule.>

## Acceptance criteria

- <Bullet 1: verifiable condition>
- <Bullet 2: verifiable condition>

**Tests:**   ← optional; added by spec-test skill
- `tests/...::test_SPEC_scr_001_...` — "behavior description"
```

---

## 2. Lifecycle

Spec items are **durable** — they do not move to `archive/` while active.
Removed or obsolete items move to the `archive/` subdirectory of their own
component directory.

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

**Moving an item between components is not a state transition.** It is a
`git mv` plus a `component:` frontmatter update (and version recompute). The ID
never changes, so no references need rewriting.

---

## 4. Operating Procedure

### Writing a new spec item

1. Determine the owning component: the most-specific component whose subject
   matter the invariant governs. Create the component directory and its
   `component.md` manifest if this is the first item for the component
   (pick an `abbrev` not used by any other component).
2. Assign the next sequential ID: `SPEC-{abbrev}-{next-seq}`, using the
   component's `abbrev` and scanning the component directory (plus git history)
   for the highest existing sequence.
3. Write the file with all required frontmatter and body sections.
4. Compute the version hash and set it in frontmatter — the version line is
   stripped before hashing to avoid a circular dependency:
   ```bash
   grep -v "^version:" .sdd/specs/{component-path}/SPEC-{abbrev}-{seq}.md | shasum -a 256 | cut -c1-8
   ```
   On Windows or where `shasum` is unavailable, use the Node equivalent (see
   Edge Cases).
5. The file is now the source of truth for this invariant.

### Updating a spec item

1. Edit the body (invariant, acceptance criteria, tests block) as needed.
2. **Recompute and update the `version` field** after every write.
   Failure to recompute leaves stale gaps undetectable.
3. All open gaps referencing this item become stale (detectable by comparing
   `audit-spec-version` on the gap vs `version` on the spec item).

### Splitting a component into sub-components

1. Create the sub-component directories, each with a `component.md`.
2. `git mv` each item file into its sub-component. IDs and `abbrev` do not
   change — only the `component:` frontmatter field (then recompute `version`).
3. Move each item's archive entries with it if any exist.
4. Update the parent's manifest `scope:` if the split narrows it.

### Deprecating or aliasing

Use `spec-collapse` skill for structural cleanup — never manually rename or
renumber spec items. Set `status: deprecated` or `status: aliased`, populate
`aliases` on the new item, and move the file to the component's `archive/`.

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
  its ID is retired (not reassigned). Aliasing handles renames. Moving an item
  between components never changes its ID.
- **One item, one component.** Every spec item lives in exactly one component
  directory, and its `component:` field matches that directory.
- **Manifests carry no member lists.** Membership is the directory; the manifest
  is identity, scope, and edges only.
- **Depth-agnostic scanning.** Any tool or skill that enumerates spec items must
  scan recursively (`find .sdd/specs -name 'SPEC-*.md' ! -path '*/archive/*'` or
  a `**` glob) — never assume a fixed depth.

---

## 6. Edge Cases

**Version hash computation without `shasum`:** Use Node.js:
`node -e "const c=require('fs').readFileSync(process.argv[1],'utf8').split('\n').filter(l=>!l.startsWith('version:')).join('\n');console.log(require('crypto').createHash('sha256').update(c).digest('hex').slice(0,8))" <file>`
(strip the version line before hashing, matching the shell command).

**Stale gap detection:** When `audit-spec-version` on a gap does not match the
current `version` on the spec item, the gap is stale — re-run spec-audit before
acting on it.

**Alias resolution:** When a gap references a deprecated/aliased spec item ID,
the valid item is found by scanning `aliases` fields on active items anywhere in
the tree. No migration of existing gaps is required.

**Legacy layouts:** a flat `{domain}/SPEC-*.md` directory or a
`{domain}/{subject}/` subdirectory is read as a one- or two-level component
tree with no manifests. Everything works except manifest-derived features
(component scope mapping, the map). Run `migrate-components` to convert.

**Spec items with no tests block:** Items without a `**Tests:**` block are surfaced
by `session-start` as uncovered. This is a warning, not a hard error.

**Abbrev collisions:** The abbreviation must be unique across all components to
avoid ID collisions. `sdd-doctor` flags duplicates; resolve by picking a new
abbrev for the newer component (existing item IDs keep their abbrev — IDs are
never renamed).

---

## See Also

- `plugin/references/schemas.md` — ID conventions and cross-reference chain
- `plugin/references/sdd-pipeline.md` — full pipeline and skill responsibilities
- `plugin/skills/spec-audit/SKILL.md` — spec-audit operating skill
- `plugin/skills/target-engage/SKILL.md` — folds targets into spec items
- `plugin/skills/migrate-components/SKILL.md` — domain → component migration
- `plugin/skills/sdd-doctor/SKILL.md` — `.sdd/` health checks

---
name: migrate-components
description: This skill should be used when the user invokes `/sdd:migrate-components`, says "migrate to components", "convert domains to components", "restructure the spec tree", "adopt the component layout", or wants to convert an existing project's flat domain-based `.sdd/specs/` layout into the area/component tree. Produces a reviewed mapping proposal first; applies it only on approval, moving files without changing any IDs.
version: 0.1.0
---

# SDD Migrate Components

Convert a project's `.sdd/specs/` from the legacy flat domain layout
(`.sdd/specs/{domain}/SPEC-*.md`) to the component tree
(`.sdd/specs/{area}/{component}/.../SPEC-*.md`). The migration is two-phase:
**propose** a mapping for user review, then **apply** it. Applying is file moves
plus frontmatter updates — **no spec item ID ever changes**, so gaps, work items,
and aliases stay valid with zero rewrites (references are ID-based and resolve
by recursive scan).

## Input

Accept one of:

- **No argument**: propose mode — analyse the current layout and write a mapping
  proposal for review
- **`apply`**: apply a previously reviewed mapping proposal
- **`apply {mapping-file}`**: apply a specific proposal file

## Phase 1 — Propose

### 1. Inventory the current layout

Scan the spec tree: `find .sdd/specs -name "SPEC-*.md" ! -path "*/archive/*"`.
For each item parse `id`, `domain:` or `component:`, `abbrev`, `status`, the
title, and any `scope:` globs. Also inventory archived spec items
(`.sdd/specs/**/archive/SPEC-*.md`) — they move with their component so alias
resolution keeps working.

If every item already carries a `component:` path matching a nested directory,
report "already migrated" and stop.

### 2. Derive the component tree

Group items by what they actually govern, not by their current directory:

- Read each item's title, invariant, and `scope:` globs; cluster items that
  govern the same concrete unit of the system (a server, a client, a CLI, a
  subsystem).
- Choose **areas** (top-level components): coarse regions of the system —
  typically 2–5 (e.g. `hub`, `pipeline`, `core`).
- Place each cluster as a **component** within an area. Nest a sub-component
  only where a cluster has a clearly distinct sub-unit with several items;
  otherwise keep the tree at two levels (depth discipline — splitting later is
  a cheap `git mv`).
- Genuinely cross-cutting rules (runtime facts, repo-wide conventions) go to a
  `core/conventions` component or the closest governing ancestor.
- Existing subject subdirectories are natural sub-component candidates.

### 3. Write the mapping proposal

Create `.sdd/specs/MIGRATE-components-{date}.md`:

```markdown
---
created: {ISO date}
status: proposed      # proposed | applied
---

# Component Migration Proposal — {date}

## Proposed tree

- hub/                (area)
  - server/           abbrev: hsrv   scope: hub/server/**
  - client/           abbrev: hcli   scope: hub/client/**
    - screens/        abbrev: scr    scope: hub/client/src/screens/**
- pipeline/           (area)
  - artifacts/        abbrev: wfa    scope: .sdd/**
  - skills/           abbrev: wfs    scope: plugin/skills/**

## Item mapping

| Item | From | To |
|---|---|---|
| SPEC-arch-001 | architecture/ | core/conventions/ |
| SPEC-arch-010 | architecture/ | hub/server/ |
| ...every active and archived item, one row each... |

## Notes

- {per-item judgement calls worth flagging}
```

Every item — active and archived — must appear in exactly one row. Existing
`abbrev` values stay on existing items (IDs are never renamed); each **new**
component picks its abbrev here, unique across the whole tree.

### 4. Report and stop

```
## Component Migration Proposal — {date}

Proposal written to: .sdd/specs/MIGRATE-components-{date}.md
{N} items mapped into {M} components across {K} areas.

Review the mapping (edit rows freely), then run:
  /sdd:migrate-components apply
```

**Never apply in the same invocation as proposing.** The user reviews first.

## Phase 2 — Apply

### 1. Validate the proposal

Read the mapping file. Verify: every active and archived spec item appears in
exactly one row; no target directory is named `archive`; every new component's
abbrev is unique across the tree; `status: proposed`.

### 2. Build the tree and manifests

For each component in the proposed tree, create the directory and write its
`component.md` manifest (`component:` full path, `abbrev:`, `scope:` globs,
`depends-on:` — start empty unless the proposal names edges, plus a
one-paragraph description). Optionally write `area.md` per area.

### 3. Move the items

For each mapping row, in one pass per item:

1. `git mv .sdd/specs/{from}/SPEC-{abbrev}-{seq}.md .sdd/specs/{to}/SPEC-{abbrev}-{seq}.md`
   (archived items move to `{to}/archive/`).
2. Edit frontmatter: set `component: {to-path}`, remove the `domain:` line
   (keep `abbrev` unchanged).
3. Recompute the `version` hash (frontmatter changed):
   `grep -v "^version:" {file} | shasum -a 256 | cut -c1-8` — and update it.
4. Move any `SPEC-{abbrev}.tests.json` mapping file alongside its items; update
   report paths only if they were relative to the old directory.

**Do not touch gaps, work items, targets, issues, or improvements.** Their
spec-item references are IDs and resolve by recursive scan. Their legacy
`domain:` fields stay valid (read as `component:`).

Note: recomputing versions makes existing open gaps read as *stale* — that is
correct and intentional; the next `spec-audit` refreshes their
`audit-spec-version` without changing gap content.

### 4. Clean up and verify

1. Remove now-empty legacy domain directories.
2. Verify: `find .sdd/specs -name "SPEC-*.md" ! -path "*/archive/*"` count equals
   the pre-migration count; every item's `component:` matches its directory;
   every component directory has a `component.md`; abbrevs unique.
3. Flip the proposal file to `status: applied` and move it to
   `.sdd/specs/archive/` (create if needed) — it is provenance, not live state.
4. Commit the whole migration as one commit ("migrate specs to component tree —
   file moves only, no ID changes").

### 5. Report

```
## Component Migration Applied — {date}

{N} items moved into {M} components across {K} areas. No IDs changed.
Open gaps now read as stale against recomputed versions — run
/sdd:spec-audit {area} per area to refresh.

Next: Run `/sdd:sdd-doctor` to verify the migrated tree is healthy.
```

## Constraints

- **IDs are untouchable.** No spec item is renamed, renumbered, or re-abbreved —
  ever. The migration is moves + frontmatter only.
- **Propose and apply are separate invocations.** Never apply an unreviewed
  mapping.
- **Every item maps exactly once.** A proposal that drops or duplicates an item
  is invalid — fix it before applying.
- **Archived items move with their component.** Alias resolution depends on the
  archive staying tracked and discoverable.
- **One commit for the whole apply.** Partial migrations are worse than none;
  if the apply fails midway, reset to the pre-migration commit and re-run.
- **Recompute `version` on every touched item.** A moved item with a stale hash
  breaks stale-gap detection silently.

## Schema Reference

Component tree, manifest schema, and ID conventions:
`references/artifacts/spec.md` and `references/schemas.md`

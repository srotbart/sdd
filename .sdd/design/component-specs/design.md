# Design: Component-Based Specs

**Date:** 2026-08-14 (revised 2026-08-15: recursive components)
**Status:** accepted
**Domain:** workflow (primary), architecture (hub touch-points)

## Problem

Spec items are grouped by **domain** — a rule-type axis (`architecture`,
`ui-components`, `ui-layout`, `ui-screens`, `workflow`). That axis doesn't match
the shape of the system the specs govern: `SPEC-arch-*` mixes hub-server routes,
client WebSocket behavior, and repo-wide runtime facts; the three `ui-*` domains
are all facets of one deliverable (the hub client). `.sdd/later.md` already
records the tension: *"Domain axis ≠ capability axis."*

The shift: specs become **component-based**. A **component** is a concrete unit
of the system (the hub server, the statusline, the skills). Components nest —
a component may contain sub-components to any depth — and the top-level
components are called **areas**: coarse regions of the system (the hub, the
plugin, the pipeline). Spec items attach to exactly one component. The structure
is also the substrate for a future visual map of the system in the hub.

## Decision summary

| Concern | Decision |
|---|---|
| Node type | **One recursive type: component.** Components contain sub-components to any depth. "Area" is the *role* of a top-level component (map container, worker fan-out unit), not a separate type |
| Hierarchy | Encoded in the directory tree: `.sdd/specs/{area}/{component}/.../SPEC-*.md`, any depth |
| Item attachment | A spec item attaches to exactly one component — the directory it sits in. **Non-leaf components may hold items directly**: an item at an interior node governs that node's whole subtree (e.g. a rule for all screens lives at `hub/client/screens/`, a rule for one screen at `hub/client/screens/dashboard/`) |
| Frontmatter | Spec items carry a single path-style `component:` field (e.g. `component: hub/client/screens`). The area is the first segment — derived, never stored separately. `domain:` is retired; readers treat a legacy `domain: x` as `component: x` |
| Component manifest | `component.md` in each component dir: description, `abbrev:`, `scope:` globs, `depends-on:` — the data that powers the map. Membership is the directory itself, never listed in the manifest (no double bookkeeping) |
| Depth discipline | The schema allows any depth; the guidance is **start at two levels** (area/component) and split a component only when it genuinely needs it. Splitting later is cheap: `git mv`, IDs stable |
| Reserved names | `archive` is not a valid component name; `component.md` / `area.md` are manifest filenames, not items. Each component dir keeps its own `archive/` |
| IDs | **Never renamed** (stable-ID invariant). Existing items keep their IDs and move files only. New items mint `SPEC-{abbrev}-{seq}` where `abbrev` comes from the owning component's manifest; abbrev uniqueness is global across all components |
| Tooling | All spec scans become **depth-agnostic**: `find .sdd/specs -name 'SPEC-*.md' ! -path '*/archive/*'` / `**` globs. Fixed two-level globs are retired |
| Guardian audit mapping | Changed file → candidates are the **most-specific component whose scope matches, plus all its ancestors** (an ancestor's rules bind descendants by definition), plus item-level `scope:` hits |
| Gaps / work items | Single `component:` path field replaces `domain:`; readers accept `domain:` as legacy during transition |
| Execution loops | `close-domain` / `spawn-sdd-worker` take a **component path** at any depth (`hub`, `hub/client`, `hub/client/screens`); the loop covers the node's subtree. An area is just the widest such path |
| Hub | Parser walks the spec tree recursively, derives `component` from the path, reads manifests; later, a **Map** screen renders nested components with `depends-on` edges and spec/gap/test badges |
| Migration | New skill `migrate-components`: mapping table produced for review, then file moves only — no ID changes, no gap rewrites (references are by ID and resolve by scan, exactly like alias-at-read) |
| SDD health | New agent skill `sdd-doctor` (worker-pattern, like sdd-worker): audits the health of `.sdd/` itself — schema/structure validity, version hashes, ID uniqueness, orphaned references, unarchived terminal items, manifest integrity |

## Detailed design

### 1. Directory layout

```
.sdd/specs/
├── core/                          ← area (top-level component)
│   ├── area.md                    ← optional area manifest
│   └── conventions/
│       ├── component.md
│       └── SPEC-arch-001.md       ← moved, ID unchanged
├── hub/                           ← area
│   ├── server/
│   │   ├── component.md
│   │   ├── SPEC-arch-010.md
│   │   └── archive/
│   └── client/
│       ├── component.md
│       ├── SPEC-ui-001.md         ← governs the whole client
│       └── screens/               ← sub-component
│           ├── component.md
│           ├── SPEC-scr-004.md    ← governs all screens or one screen's rules
│           └── dashboard/         ← deeper only when it earns it
└── pipeline/                      ← area
    ├── artifacts/
    ├── skills/
    └── tooling/
```

Spec `archive/` dirs move with their component and stay tracked.

### 2. Component manifest — `component.md`

```markdown
---
component: hub/client/screens    # full path from the specs root — must match the dir
abbrev: scr                      # shorthand for NEW spec items minted here
scope:
  - hub/client/src/screens/**
depends-on:                      # other components, full paths
  - hub/server
---

# hub/client/screens

One paragraph: what this component is, where it lives in the codebase.
```

- `scope:` globs move the *shared* file-mapping up from per-item frontmatter;
  per-item `scope:` remains for items whose reach differs from their component.
- `depends-on:` is declarative; it exists to draw the map today and is
  audit-relevant later (a dependency edge is a place gaps propagate).
- An `area.md` at the top level is optional: description and display order only.
- This deliberately amends the old "no domain-level manifest" rule: the manifest
  is what makes the structure visualizable and the file→component mapping
  deterministic. It stays small — identity, scope, edges — never a member list.

### 3. IDs and abbrevs

- Existing IDs (`SPEC-arch-*`, `SPEC-uic-*`, `SPEC-ui-*`, `SPEC-scr-*`,
  `SPEC-wf-*`) are permanent. Files move; IDs, and gap references do not change.
  The abbrev no longer needs to match the directory — it already doesn't for
  subject subdirs today.
- New items take the owning component's `abbrev` from its manifest and the next
  sequence within that component (same git-history scan as today, scoped to the
  component dir).
- Abbrev uniqueness is enforced across all components (was: across domains).

### 4. Compatibility

- **Layouts:** legacy flat `{domain}/SPEC-*.md` and subject-subdir layouts are
  simply shallow component trees — depth-agnostic scans read them unchanged.
- **Hub parser:** recursive walk; `domain` field stays populated (first path
  segment) so existing screens keep working; `component` is additive.
- **Statusline:** counts already use depth-agnostic `find` — unaffected.
- **Version hashes:** unchanged by file moves (content-addressed, path-free).
  Adding/changing frontmatter (e.g. `component:`) does change content, so the
  migration recomputes `version` on every touched item.
- **Stale detection, alias resolution:** unchanged — both are ID-based scans.

### 5. Migration (strawman mapping for this repo — to be reviewed per-item)

| Today | Becomes |
|---|---|
| `architecture/` server items (routes, ws, db, watcher, pty — the bulk) | `hub/server` |
| `architecture/` client items (ws client, reconnect, liveAgents) | `hub/client` |
| `architecture/` runtime facts (Node, React+Vite, ports) | `core/conventions` (or the owning component) |
| `ui-layout/` | `hub/client` |
| `ui-screens/` | `hub/client/screens` |
| `ui-components/` | `hub/client/components` |
| `workflow/` artifact + archive rules | `pipeline/artifacts` |
| `workflow/` skill-behavior rules | `pipeline/skills` |
| `workflow/` statusline/script rules | `pipeline/tooling` |
| `design/` (jsx/html mockups — not spec items) | out of `.sdd/specs/` → `.sdd/design/hub-ui/` |

Mechanics live in the `migrate-components` skill: produce a `mapping.md`
(item → component) for review; on approval, `git mv` per item, set `component:`
frontmatter (drop `domain:`/keep as legacy), recompute `version`, write
manifests, leave open gaps untouched.

### 6. Visualization (later, hub)

A **Map** screen: nested boxes for the component tree (render two levels by
default, drill in), `depends-on` as edges. Badges per component: active spec
count, open gaps, failing/uncovered tests, stalest audit age. Clicking a
component filters the existing Specs/Gaps screens to its subtree. All data
comes from manifests + existing parsers — no new artifact types.

### 7. SDD health — `sdd-doctor`

A dedicated agent, mirroring the sdd-worker pattern, whose subject is `.sdd/`
itself rather than the project code. It checks that artifacts are structurally
valid and stable: required frontmatter present, version hashes correct, IDs
unique, references resolvable, terminal items archived, manifests consistent
with their directories, abbrevs unique. Mechanical fixes are applied directly;
judgement calls are reported. See `plugin/skills/sdd-doctor/SKILL.md`.

### 8. Phasing

1. **Concept + schema** — reference guides + skills speak components; manifests
   defined; new spec items use the new layout. *(this change)*
2. **Migration tooling** — `migrate-components` skill. *(this change)*
3. **Health tooling** — `sdd-doctor` skill. *(this change)*
4. **This repo's own migration** — run `migrate-components` here, review the
   mapping, move the files. *(separate, deliberate run)*
5. **Hub Map** — manifest parsing + the visualization screen. *(later)*

## Resolved questions

- **Sub-components:** yes — components nest recursively; areas are the top level
  of the same tree, not a separate type. Interior nodes may hold items.
- **Hub client granularity:** start with `hub/client`; split into
  `screens/` / `components/` sub-components during migration (the strawman above
  does). Depth discipline makes this cheap to revisit.
- **Loop scoping:** one skill, any component path; the subtree is the unit.
- **Frontmatter:** single `component:` path field; `area:` never stored.

## Open questions

1. **Abbrev churn** — new per-component abbrevs vs. keeping the current five
   frozen and only adding abbrevs for new components. (Migration default: keep
   existing abbrevs on existing items; new components pick fresh abbrevs.)
2. **Area set for this repo** — `core` / `hub` / `pipeline`, and whether
   `pipeline` or `plugin` names the area better. Decided at migration review.

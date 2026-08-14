# Design: Component-Based Specs

**Date:** 2026-08-14
**Status:** proposed
**Domain:** workflow (primary), architecture (hub touch-points)

## Problem

Spec items are grouped by **domain** — a rule-type axis (`architecture`,
`ui-components`, `ui-layout`, `ui-screens`, `workflow`). That axis doesn't match
the shape of the system the specs govern: `SPEC-arch-*` mixes hub-server routes,
client WebSocket behavior, and repo-wide runtime facts; the three `ui-*` domains
are all facets of one deliverable (the hub client). `.sdd/later.md` already
records the tension: *"Domain axis ≠ capability axis."*

The shift: specs become **component-based**. A **component** is a concrete unit
of the system (the hub server, the statusline, the skills). Components are placed
within **areas** — coarse regions of the system (the hub, the plugin, the
pipeline). Spec items attach to exactly one component. The structure is also the
substrate for a future visual map of the system in the hub.

## Decision summary

| Concern | Decision |
|---|---|
| Hierarchy | `Area → Component → spec items`, encoded in the directory tree: `.sdd/specs/{area}/{component}/SPEC-*.md` |
| Depth | Two directory levels — identical to today's `{domain}/{subject}/` shape, so existing skill globs and the hub parser's directory walk keep working |
| Frontmatter | Spec items gain `area:` and `component:`; `domain:` is retired (kept, deprecated, during migration so old parsers don't break) |
| Component manifest | New `component.md` in each component dir: description, `scope:` globs, `depends-on:` — the data that powers the map |
| Area manifest | Optional `area.md` per area dir: description, display order |
| IDs | **Never renamed** (stable-ID invariant). Existing items keep their IDs and move files only. New items mint `SPEC-{abbrev}-{seq}` where `abbrev` is the **component** shorthand; uniqueness of `abbrev` is now global across components |
| Cross-cutting invariants | Live in a `conventions` component within their area (or the `core` area for repo-wide rules); per-item `scope:` globs continue to express reach beyond the component |
| Gaps / work items | `component:` field replaces `domain:` (derive `area` from the component). Transitional rule: readers accept either field |
| Execution loops | `close-domain` / `spawn-sdd-worker` re-scope to take an **area or a component** (a component is the natural close unit; an area fans out over its components) |
| Hub | Parser derives area/component from path + frontmatter; later, a **Map** screen renders areas as containers, components as nodes, `depends-on` as edges, with spec/gap/test badges |
| Migration | File moves only, one reviewed mapping table, no ID changes, no gap rewrites (references are by ID and resolve by scan, exactly like alias-at-read) |

## Detailed design

### 1. Directory layout

```
.sdd/specs/
├── core/                          ← area (repo-wide)
│   ├── area.md
│   └── conventions/               ← component
│       ├── component.md
│       └── SPEC-arch-001.md       ← moved, ID unchanged
├── hub/                           ← area
│   ├── area.md
│   ├── server/
│   │   ├── component.md
│   │   ├── SPEC-arch-010.md
│   │   └── archive/
│   ├── client/                    ← shell, ws client, layout
│   ├── screens/
│   └── components/                ← the design-system component
└── pipeline/                      ← area (the SDD workflow itself)
    ├── artifacts/                 ← artifact rules (most of SPEC-wf-*)
    ├── skills/
    └── tooling/                   ← statusline, scripts
```

Spec `archive/` dirs move down one level with their items and stay tracked.

### 2. Component manifest — `component.md`

```markdown
---
component: server
area: hub
abbrev: hsrv            # shorthand for NEW spec items in this component
scope:
  - hub/server/**
depends-on: []          # other components, as {area}/{component}
---

# hub/server

One paragraph: what this component is, where it lives in the codebase.
```

- `scope:` globs move the *shared* file-mapping up from per-item frontmatter;
  per-item `scope:` remains for items whose reach differs from their component.
  The guardian audit's *changed file → candidate spec items* mapping becomes:
  changed file → component (via manifest scope) → its items, plus any item-level
  glob hits — deterministic and cheap.
- `depends-on:` is declarative and audit-relevant later (a dependency edge is a
  place gaps propagate); for now it exists to draw the map.
- This deliberately amends the old "no domain-level manifest" rule: the manifest
  is what makes the structure visualizable and the file-mapping deterministic.
  It stays small — identity, scope, edges — never a list of member items
  (membership is the directory, no double bookkeeping).

### 3. IDs and abbrevs

- Existing IDs (`SPEC-arch-*`, `SPEC-uic-*`, `SPEC-ui-*`, `SPEC-scr-*`,
  `SPEC-wf-*`) are permanent. Files move; IDs, versions, and gap references do
  not change. The abbrev no longer needs to match the directory — it already
  doesn't for subject subdirs today.
- New items take the component's `abbrev` from its manifest and the next
  sequence *within that component* (same git-history scan as today, scoped to
  the component dir).
- Abbrev uniqueness is enforced across all components (was: across domains).

### 4. Compatibility

- **Skill globs:** every skill that reads specs already globs both
  `{dir}/SPEC-*.md` and `{dir}/*/SPEC-*.md`; the new layout is exactly the
  second form. During migration both layouts are legal.
- **Hub parser:** `parseSpecs` walks domain dirs plus one subdir level — the
  new tree parses today with `area` landing in the `domain` field. The real
  change is additive: read manifests, emit `area`/`component` on each item.
- **Statusline:** counts use depth-agnostic `find` — unaffected.
- **Version hashes:** unchanged by moves (content-addressed, path-free).
- **Stale detection, alias resolution:** unchanged — both are ID-based scans.

### 5. Migration (strawman mapping — to be reviewed per-item)

| Today | Becomes |
|---|---|
| `architecture/` server items (routes, ws, db, watcher, pty — the bulk) | `hub/server` |
| `architecture/` client items (ws client, reconnect, liveAgents) | `hub/client` |
| `architecture/` runtime facts (Node, React+Vite, ports) | `core/conventions` (or the owning component) |
| `ui-layout/` | `hub/client` |
| `ui-screens/` | `hub/screens` |
| `ui-components/` | `hub/components` |
| `workflow/` artifact + archive rules | `pipeline/artifacts` |
| `workflow/` skill-behavior rules | `pipeline/skills` |
| `workflow/` statusline/script rules | `pipeline/tooling` |
| `design/` (jsx/html mockups — not spec items) | out of `.sdd/specs/` → `.sdd/design/hub-ui/` |

Mechanics: one migration pass produces a `mapping.md` (item → component) for
review; on approval, `git mv` per item, add `area:`/`component:` frontmatter
(and recompute `version`, since frontmatter changed), write manifests, update
gap/work-item readers to accept `component:`. Open gaps are untouched.

### 6. Visualization (later, hub)

A **Map** screen: areas as containers, components as cards, `depends-on` as
edges. Badges per component: active spec count, open gaps, failing/uncovered
tests, stalest audit age. Clicking a component filters the existing Specs/Gaps
screens to it. All data comes from manifests + existing parsers — no new
artifact types.

### 7. Impact inventory

- `plugin/references/artifacts/spec.md`, `schemas.md`, `sdd-pipeline.md` — new
  hierarchy, manifest schema, abbrev rule.
- Skills mentioning `domain`: `spec-audit`, `gap-to-work-items`,
  `work-item-close`, `close-domain`, `spawn-sdd-worker`, `session-start`,
  `spec-collapse`, `spec-test`, `target-engage` — terminology + scoping.
- `plugin/scripts/spec-index.js` — group by area/component.
- Hub: parser (`sdd-parser.ts`), types, Specs screen grouping; Map screen later.
- Gap/work-item frontmatter: `component:` (readers accept `domain:` during
  transition).

### 8. Phasing

1. **Concept + schema** — this doc → target → fold rules into the spec;
   manifests defined; new spec items use the new layout.
2. **Migration** — mapping table reviewed, files moved, manifests written.
3. **Skills + terminology** — loops re-scoped, docs updated, `domain:` retired.
4. **Hub Map** — manifest parsing + the visualization screen.

## Open questions

1. **Hub client granularity** — one `hub/client` component, or the finer
   `client` / `screens` / `components` split proposed above? (Finer matches the
   existing three ui-domains and draws a better map; coarser is less ceremony.)
2. **Loop scoping** — should `close-domain` become `close-component` outright,
   or keep one skill that accepts an area *or* a component?
3. **Abbrev churn** — new per-component abbrevs (`hsrv`, `hcli`, …) vs. keeping
   the current five abbrevs frozen and only adding new ones for new components.
4. **Area set** — is `core` / `hub` / `pipeline` the right top level for this
   repo, and does `pipeline` vs `plugin` name the area better?

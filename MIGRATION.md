# Migrating to Component-Based Specs

This guide is for anyone — user or agent — whose project uses the SDD plugin
with the original **domain-based** spec layout and wants to understand what
changed, what to expect, and how to move to the **component-based** layout.

**TL;DR: nothing breaks if you do nothing.** Every reader in the pipeline
accepts the legacy layout indefinitely. Migration is opt-in, reviewed before
anything moves, changes no IDs, and is reversible (it lands as a single
commit). Migrate when you want the new capabilities, not because you must.

---

## What changed

Specs used to be grouped by **domain** — a rule-type axis (`architecture`,
`ui-components`, `workflow`). They are now grouped by **component** — the
concrete unit of the system a rule governs. Components nest to any depth, and
the top-level components are called **areas**.

| | Before (domains) | After (components) |
|---|---|---|
| Layout | `.sdd/specs/{domain}/SPEC-*.md` (flat, optional one subject level) | `.sdd/specs/{area}/{component}/…/SPEC-*.md` (recursive) |
| Spec frontmatter | `domain: authentication` | `component: core/authentication` (full path) |
| Gap / work item / target frontmatter | `domain: {name}` | `component: {path}` |
| Grouping metadata | none ("no domain-level manifest") | `component.md` manifest per component: `abbrev`, `scope:` globs, `depends-on:` |
| Execution loop unit | one domain | one component path at any depth (`hub`, `hub/client`) — the loop covers its subtree |
| Version hash | ambiguous (two documented formulas) | one formula: hash with the `version:` line stripped — `grep -v "^version:" {file} \| shasum -a 256 \| cut -c1-8` |
| Cross-component rules | n/a | contract items with **bindings** (see below) |

An item placed at a non-leaf component governs that component's whole subtree.
Depth is discipline, not schema: start at two levels; split a component later
with a plain `git mv` — **IDs never change**, so nothing references break.

### New since the change (works in both layouts)

- **`/sdd:sdd-doctor`** — a health agent for `.sdd/` itself: schema validity,
  version hashes, reference resolution, archive hygiene, binding integrity.
  Run it any time; it never touches invariants.
- **Contracts and bindings** — a rule binding two components (producer's
  promise, consumer's reliance) lives with the **producer** and carries
  `contract-consumer:` plus `contract-synced: [{item-id}@{hash}, …]` stamps.
  Drift on either edge is detected by comparing stamps to current versions.
- **The stamping script** — `plugin/scripts/stamp.js`: the one deterministic
  way hashes get written. `stamp.js version {file}|--all` recomputes version
  hashes, `stamp.js contract {file}` re-stamps a binding (after you re-verify
  it), and `stamp.js check --all` verifies the whole tree — exit 1 on any
  mismatch, so it drops straight into CI or a pre-commit hook. Agents never
  hand-compute hashes.
- **The hub `map` tab** — the component tree rendered live, with gap/coverage
  badges per component, `depends-on` edges, and contract edges colored by
  binding status. Works on unmigrated projects too (domains render as
  one-level components; edges appear once manifests exist).

---

## What keeps working without migrating

These are commitments, not accidents — the plugin's readers are built to
accept both worlds:

- **Legacy `domain:` frontmatter** is read as a one-level component path by
  every skill, the hub, the statusline, `spec-index.js`, and sdd-doctor.
- **Flat directory layouts** parse as one-level component trees everywhere
  (all spec scans are recursive and depth-agnostic).
- **Legacy version hashes keep functioning.** Stale-gap detection compares
  stored-vs-stored values and never recomputes, so it stays self-consistent
  whatever convention stamped them. (Old whole-file hashes can't be
  *verified* after the fact — the stored value is part of what would be
  hashed — so `stamp.js check` will flag them; restamping the tree is a
  deliberate one-time decision, never automatic, because it flips open gaps
  to stale.) Hashes converge to the new formula on each item's next real
  edit.
- **Both ID suffix forms** (`-001` sequential and `-3f9c2a1` hash) stay valid
  everywhere, as before.
- **Mixed states parse fine** — you can sit mid-migration without breakage,
  though finishing is recommended (see below).

---

## How to migrate

The `/sdd:migrate-components` skill drives the whole thing in two separated
phases. Budget one review sitting; the mechanical part is fast.

1. **(Recommended) health check first:** `/sdd:sdd-doctor` — fix or note
   anything structural before moving files.
2. **Propose:** `/sdd:migrate-components` — the agent inventories every spec
   item (active *and* archived), derives a draft area/component tree from what
   the items actually govern, and negotiates it with you area by area:
   explaining the plan in plain language, confirming the area set, summarising
   where each domain's items land, and asking about every ambiguous placement
   instead of guessing. Once you agree to the shape, it writes
   `.sdd/specs/MIGRATE-components-{date}.md`: the agreed tree plus one mapping
   row per item.
3. **Review the mapping file** — the file, not the conversation, is what apply
   executes, so it gets a final read. Edit rows freely: rename areas, merge or
   split components, re-home items. The tree should reflect *your* system's
   shape.
4. **Apply:** `/sdd:migrate-components apply` — per item: `git mv` to the new
   directory, set `component:`, drop `domain:`, recompute `version`;
   `component.md` manifests written; **active** gaps/work-items/targets/
   issues/improvements get their `domain:` line renamed to `component:`
   (frontmatter rename only — IDs, status, references, and body content are
   never touched; archived ephemeral files are never touched). One commit.
5. **Verify:** `/sdd:sdd-doctor` — confirms item counts match, every
   `component:` matches its directory, every component has a manifest,
   abbrevs are unique, and no active artifact still carries `domain:`.
6. **Re-audit:** open gaps now read as *stale* — expected, see below — so run
   `/sdd:spec-audit {area}` per area (or `/sdd:spawn-sdd-worker {area}`) to
   refresh them.

### What to expect immediately after applying

- **All open gaps read as stale.** Intentional: migrated items' `version`
  hashes were recomputed (their frontmatter changed). The next spec-audit
  refreshes each gap's `audit-spec-version` without altering gap content.
  Nothing about the *code* is implied to have changed.
- **No renamed IDs, no rewritten references.** `SPEC-arch-001` is still
  `SPEC-arch-001`, wherever it now lives; gaps and work items resolve by
  recursive scan. Alias resolution (from old spec-collapses) keeps working —
  spec archives move with their component and stay tracked.
- **Old abbrevs persist on old items.** The item-ID abbrev no longer needs to
  match the directory. New items minted in a component use the abbrev from
  that component's manifest (unique across the tree).
- **The hub picks the tree up immediately** — nested cards on the map, area
  grouping preserved on the specs screen.
- **Rollback** is `git revert` of the single migration commit.

### After migrating: authoring rules that changed

- New spec items go in their component's directory with `component:` (path)
  frontmatter; a genuinely new component gets a directory + `component.md`
  first (pick an unused abbrev).
- `.tests.json` mapping files sit next to the items they map.
- Cross-component rules: put the contract item in the **producer** component
  with `contract-consumer:` and `contract-synced:` stamps; re-verify + re-stamp
  when a binding drifts (drift is a prompt to re-check, not proof of breakage).
- Worker/audit invocations take component paths: `/sdd:spec-audit hub/client`.

---

## Reference material (the authoritative sources)

| Question | Where |
|---|---|
| Full component/spec schema, manifests, contracts | `plugin/references/artifacts/spec.md` |
| All artifact quick-reference schemas | `plugin/references/schemas.md` |
| Migration mechanics (agent-facing, exhaustive) | `plugin/skills/migrate-components/SKILL.md` |
| Health checks | `plugin/skills/sdd-doctor/SKILL.md` |
| Design rationale and decision history | `.sdd/design/component-specs/design.md` |

## FAQ

**Do I have to migrate?** No. Unmigrated projects are first-class
indefinitely.

**Can I migrate halfway?** It parses, but don't stay there — `apply` is
all-or-nothing by design (one reviewed mapping, one commit) precisely so no
project lingers half-converted.

**Two components ended up with the same abbrev?** New-item IDs would collide.
sdd-doctor flags it; fix by picking a new abbrev in one manifest (existing
item IDs keep theirs — IDs are never renamed).

**My scripts grep `.sdd/specs/{domain}/`?** Switch to a recursive scan:
`find .sdd/specs -name "SPEC-*.md" ! -path "*/archive/*"` — correct for both
layouts.

**Does migrating change what the worker does?** No — same loop, addressed by
component path instead of domain name, and it now selects governing items
using component ancestry and manifest scope globs (more precise, same
behavior otherwise).

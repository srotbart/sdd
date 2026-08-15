# SDD — Spec-Driven Development Plugin

Shift the workflow from telling agents what to do toward declaring what must be true.
Agents find the gaps and close them.

## The Core Idea

Instead of telling the agent **what to do**, declare **what must be true**. The agent
finds where reality diverges from the declaration and closes the gaps. This produces:

- A stable spec that survives many iterations
- A traceable audit trail from intent → spec → gap → fix
- Work items scoped to a specific divergence, not a vague task

## What's in This Repo

| Path | What it is |
|---|---|
| `plugin/` | The Claude Code plugin: skills, artifact guides, statusline, drift-check scripts |
| `hub/` | The SDD Hub — a local web app (Node 22, Express + React) that visualises `.sdd/` state live |
| `.sdd/` | This repo's own SDD state — the project is built with its own workflow |

## The Pipeline

```
target (intent) → negotiate → fold into spec → audit codebase → gaps → work items → close
                                     ↑                                                │
                                     └──── review (issues / improvements) ← refactor ─┘
```

Concrete skill chain: `target-engage` (intent) → then the execution loop
`close-domain` drives — `spec-audit` → `gap-to-work-items` → `work-item-close`,
capped by a cross-component guardian audit — with `review-issues` /
`review-improvements` / `review-engage` feeding findings back in. `session-start`
snapshots the whole state; `spawn-sdd-worker` hands the execution phase to an
autonomous worker that runs `close-domain` for a component subtree, and
`sdd-doctor` keeps `.sdd/` itself healthy (schemas, hashes, references,
archive hygiene).

Terminal state: no open gaps, no pending work items.

## The Artifacts

All state lives under `.sdd/` at the project root:

| Directory | Purpose | Who writes it |
|---|---|---|
| `.sdd/targets/` | User-written intent. Negotiated in-document. | User (agent responds) |
| `.sdd/specs/` | Canonical, structured spec items — a **component tree**: areas contain components, components may nest. The source of truth. | Agent (from targets) |
| `.sdd/gaps/` | Audit findings — where the codebase diverges from the spec. | Agent (from audit) |
| `.sdd/work-items/` | Scoped tasks that close gaps. | Agent (from gaps) |
| `.sdd/issues/` | Reviewer-flagged problems. | Agent (review skills) |
| `.sdd/improvements/` | Reviewer-proposed enhancements. | Agent (review skills) |

Supporting directories: `.sdd/design/` (optional pre-target design docs),
`.sdd/standards/` (user-authored coding standards — the review rubric),
`.sdd/projections/` (synthesised explanation documents from `/sdd:explain`).

**Components.** Spec items attach to **components** — concrete units of the system,
organized as a recursive directory tree under `.sdd/specs/`. Top-level components are
**areas** (`hub`, `pipeline`); a component may hold sub-components, and an item at a
non-leaf component governs its whole subtree. Each component carries a `component.md`
manifest (abbrev, code-scope globs, `depends-on` edges — the data a future map screen
renders). Legacy flat domain layouts are one-level component trees and keep working;
`/sdd:migrate-components` converts them without changing a single ID.

**IDs.** Sequential for durable artifacts (`TGT-{seq}`, `SPEC-{abbrev}-{seq}`); ephemeral
artifacts mint collision-free hash IDs (`GAP-wf-b861c4b`, `WI-wf-dc57a5a`). Legacy
sequential ephemeral IDs remain valid.

**Archiving.** Terminal-state artifacts are committed first, then moved to a local
`archive/` subdirectory that is gitignored — git history is the durable archive, the
local copy is a convenience cache. Spec archives are the exception: deprecated/aliased
spec items stay tracked because alias resolution depends on them. Specs are never
deleted, only archived.

## Skills

| Skill | Invoke | Purpose |
|---|---|---|
| Close Domain | `/sdd:close-domain` | The sdd-worker's operating loop — drives the full execution pipeline for one component subtree (audit → decompose → close → guardian audit) |
| Explain | `/sdd:explain` | Use when the user invokes `/sdd:explain <subject>`, asks to "explain how X works", "document X", "write an explanation of X", or wants a deep-dive document on a component, concept, or subsystem in the current project |
| Gap To Work Items | `/sdd:gap-to-work-items` | says "decompose gaps into work items", "create work items for GAP-auth", "generate work items from gap report", "break down gaps for authentication", or wants to turn open gap files into actionable work items |
| Install Statusline | `/sdd:install-statusline` | invokes `/sdd:install-statusline` or asks to "install the SDD statusline", "set up the statusline", or "add SDD statusline to Claude Code" |
| Migrate Components | `/sdd:migrate-components` | says "migrate to components", "convert domains to components", "restructure the spec tree", "adopt the component layout", or wants to convert an existing project's flat domain-based `.sdd/specs/` layout into the area/component tree |
| Next | `/sdd:next` | says "what should I do next", "what's the next step", "recommend a next action", "prioritise SDD work", or wants a ranked list of candidate next actions across all components with priority, recommendation, and size signals, and then routes the chosen action to the appropriate skill |
| Projection Comments | `/sdd:projection-comments` | Use when the user invokes `/sdd:projection-comments <name>`, says "address projection comments for <name>", "process comments on <name>", or wants to apply and prune pending comments on a projection document |
| Review Engage | `/sdd:review-engage` | says "engage issue ISS-auth-001", "engage improvement IMP-auth-001", "discuss this finding", "accept this issue", "dismiss this improvement", "what should I do about ISS-X", or wants to interactively decide what to do with an issue or improvement artifact |
| Review Improvements | `/sdd:review-improvements` | says "find improvements", "suggest refactors", "what can be simplified", "propose enhancements", or wants a 3-agent team to propose improvements — enhancements, refactors, simplifications, performance, ergonomics, better patterns |
| Review Issues | `/sdd:review-issues` | says "run a code review", "find issues in the codebase", "sweep for problems", "review component X for issues", or wants a 3-agent team to flag code bugs, anti-patterns, smells, and spec problems and write them as issue artifacts |
| Sdd Doctor | `/sdd:sdd-doctor` | says "check SDD health", "validate the .sdd directory", "is my spec tree consistent", "run the sdd doctor", "fix the sdd structure", or wants an agent focused on the health of `.sdd/` itself — artifact schemas, structure, version hashes, references, and archive hygiene — rather than the project code |
| Sdd Help | `/sdd:sdd-help` | says "how does SDD work", "explain spec-driven development", "what is the SDD workflow", "how do I use SDD", "explain the SDD pipeline", "what are SDD skills", or wants to understand spec-driven development before starting or when confused about the workflow |
| Sdd Init | `/sdd:sdd-init` | says "initialize SDD", "set up SDD", "create the SDD folder", "bootstrap SDD for this project", or wants to start using spec-driven development in a project that has no `.sdd/` directory yet |
| Session Start | `/sdd:session-start` | says "start my SDD session", "show SDD state", "what's pending in SDD", "what targets are waiting", "check my SDD", or begins work on a spec-driven project and wants a status snapshot |
| Spawn Sdd Worker | `/sdd:spawn-sdd-worker` | Use when the user invokes `/sdd:spawn-sdd-worker`, says "spawn the sdd worker", "start the sdd worker", "hand off execution to the worker", or wants to delegate the execution phase (spec-audit, gap creation, work item closure) to an autonomous agent for a given component |
| Spec Audit | `/sdd:spec-audit` | says "audit the spec", "audit authentication spec", "check the codebase against spec", "find gaps in SPEC-auth", "run a gap audit", "audit SPEC-auth-003", or wants to know where the codebase diverges from a spec |
| Spec Collapse | `/sdd:spec-collapse` | says "collapse the spec", "consolidate spec items", "merge spec items", "clean up the spec", "spec is getting messy", or wants to propose structural reorganisation of spec files |
| Spec Test | `/sdd:spec-test` | says "write tests for the spec", "add spec tests for authentication", "cover SPEC-auth-001 with a test", "generate integration tests for the spec", "which spec items have no tests", or wants to add automated test coverage to spec items |
| Target Engage | `/sdd:target-engage` | says "engage target TGT-XXX", "respond to this target", "process this target", "reconcile TGT-XXX with spec", "fold target into spec", or otherwise asks the agent to act on a target file in the SDD workflow |
| Work Item Close | `/sdd:work-item-close` | says "close work item WI-auth-001", "implement WI-auth-001", "work on WI-auth-001", "close the next work item", or wants to implement a specific work item including tests |

This table is generated from each skill's `SKILL.md` frontmatter by
`plugin/scripts/gen-skills-table.js --update` and checked by
`plugin/scripts/check-skills-drift.js` — don't edit it by hand.

## The Hub

`hub/` is a local web app that renders the `.sdd/` directory live: dashboard, targets,
specs (with per-item detail and test coverage), gaps, work items, issues, improvements,
designs, projections, standards, and session activity. The server binds a fixed
`127.0.0.1:22351` and enforces a single running instance.

```
cd hub
npm install
npm run dev     # server + client (Vite dev client on :22400)
```

## Getting Started

```
/sdd:sdd-init                      # scaffold .sdd/ and capture your first target
/sdd:target-engage TGT-001         # negotiate the target in-document
# [answer agent questions in TGT-001.md, flip status to awaiting-agent]
/sdd:target-engage TGT-001         # agent proposes Current statement, flips to ready
/sdd:target-engage TGT-001         # agent folds into spec, archives target
/sdd:spec-audit authentication     # find gaps in the codebase
/sdd:gap-to-work-items authentication
/sdd:work-item-close WI-auth-a1b2c3d
/sdd:session-start                 # check remaining state
```

Or hand the execution phase (audit → gaps → work items → close) to an autonomous
worker: `/sdd:spawn-sdd-worker authentication` — the argument is a component path
at any depth (`hub`, `hub/client`, or a legacy flat domain name).

Keep `.sdd/` itself healthy with `/sdd:sdd-doctor` (schemas, version hashes,
references, archive hygiene), and adopt the component tree in an existing project
with `/sdd:migrate-components` (reviewed mapping, file moves only, IDs unchanged).

## Target Status Lifecycle

```
draft → awaiting-agent → awaiting-user → ready → accepted → [archive]
                                                ↘ archived → [archive]
```

- User flips to `awaiting-agent` when they want a response
- Agent flips to `awaiting-user` after responding, or `ready` when done
- Either party flips to `ready` when the target is settled
- `accepted` means folded into spec — archived automatically
- `archived` means abandoned — archived automatically

## Terminal States (trigger archive)

| Artifact | Archives on | Stays active |
|---|---|---|
| Target | `accepted`, `archived` | `draft`, `awaiting-agent`, `awaiting-user`, `ready` |
| Spec item | `deprecated`, `aliased` | `active` |
| Gap | `closed`, `accepted`, `deferred` | `open` |
| Work item | `done`, `abandoned` | `pending`, `in-progress`, `blocked` |
| Issue / Improvement | `accepted`, `dismissed` | `open`, `awaiting-user`, `awaiting-agent` |

Note: `blocked` work items stay active and visible in `session-start` — they need a
decision, not burial.

## Design Decisions

**One file per artifact.** Archiving is a file move, not an edit. This makes
terminal-state transitions atomic and reversible.

**Component-based specs.** Specs are organized by what they govern (components in
areas), not by rule type. One recursive node type: an area is simply a top-level
component. Items may attach to non-leaf components (governing the subtree); depth is
discipline, not schema — start at two levels and split only when a component earns
it, which is a cheap `git mv` because IDs never move with the tree. Manifests carry
identity, scope globs, and dependency edges — never member lists.

**History is the archive (ephemeral artifacts).** Terminal state is committed before
the file moves into a gitignored local `archive/`. The repo stays slim; provenance
lives in git history. Fresh clones start with empty archives, and no skill may depend
on archive contents being present.

**Hash IDs for ephemeral artifacts.** Gaps, work items, issues, and improvements mint
`{prefix}-{abbrev}-{7hex}` IDs, so parallel branches and empty local archives can't
cause ID collisions. Sequential types (targets, specs) scan git history for the next
number.

**Alias-at-read for spec-collapse.** When spec items are merged or renamed, old IDs
become aliases in the surviving item's frontmatter. Existing gap files are never
updated — resolution happens at read time by scanning for the alias. Spec-collapse is
safely rejectable with no cascade writes required.

**Content hash for spec versioning.** Each spec item file carries a `version` field
computed as `grep -v "^version:" SPEC-{abbrev}-{seq}.md | shasum -a 256 | cut -c1-8`.
Stripping the version line before hashing avoids a circular dependency. Session-start
uses this to detect stale gap audits.

**Atomic writes in target-engage.** Dialog entry and status flip happen in a single
file edit with no confirmation step. Prevents half-written state.

**~3 round soft cap in target-engage.** After round 3, the agent commits to a
best-effort Current statement rather than continuing to ask clarifying questions.

**Conflict files as siblings.** When a ready target contradicts the spec, a
`.sdd/targets/TGT-007.conflict.md` file is created alongside the target. The user
resolves it and deletes the file, then re-runs `target-engage`.

**User-authored standards, three enforcement layers.** Coding standards live in
`.sdd/standards/` and are enforced proactively (surfaced at session-start), mechanically
(`plugin/scripts/lint-check.sh`), and at review time (the `review-issues` rubric).

## Roadmap

Where the project is heading — shipped, in flight, and aspirational — lives in
[`ROADMAP.md`](ROADMAP.md). It is derived from `.sdd/targets/` and git history, not a
wishlist.

## Artifact Schemas

Full schemas, ID conventions, and state machines:
[`plugin/references/schemas.md`](plugin/references/schemas.md)

Per-artifact operating guides:
[`plugin/references/artifacts/`](plugin/references/artifacts/)

Pipeline overview and skill responsibilities:
[`plugin/references/sdd-pipeline.md`](plugin/references/sdd-pipeline.md)

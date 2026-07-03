# Roadmap

Where the SDD project is heading. This document is **derived, not aspirational fiction**:
"In flight" mirrors the active targets in [`.sdd/targets/`](.sdd/targets/), "Shipped"
mirrors accepted targets and merged work in git history, and "Later" holds ideas that
have a written trace (a target with open decisions, or an entry in `.sdd/later.md`) but
no committed direction yet.

Maintenance rule: update this file when a target is added, accepted, or abandoned. The
active-target list here should always agree with `/sdd:session-start` output. Automated
drift-checking of this surface is itself on the roadmap (TGT-122).

_Last updated: 2026-07-03_

---

## Shipped

**Core pipeline** — the full intent → spec → gap → work-item loop:
target negotiation in-document (`target-engage`), spec folding with content-hash
versioning, codebase audits (`spec-audit`), gap decomposition (`gap-to-work-items`),
scoped implementation with tests (`work-item-close`), and a state snapshot
(`session-start`) with orientation, operating contract, and standards delivery.

**Review layer** — 3-agent review teams that write findings as artifacts
(`review-issues`, `review-improvements`) and an interactive decision flow
(`review-engage`) that turns findings into spec changes, gaps, or dismissals.

**Spec test coverage** — `spec-test` links spec items to automated tests; 164 of 168
active spec items are covered across five domains (architecture, ui-components,
ui-layout, ui-screens, workflow).

**The SDD Hub** — a local web app (Express + React, fixed port 22351, single-instance)
that renders `.sdd/` live: dashboard, targets, specs with per-item detail and test
status, gaps, work items, issues, improvements, designs, projections, standards, and
session activity.

**Standards layer** — user-authored coding standards in `.sdd/standards/`, enforced
proactively (session-start), mechanically (`lint-check.sh`), and at review time.

**Drift tooling** — generators and checks for the derived surfaces: README skills
table, sdd-help skill list, artifact guides (`gen-skills-table.js`,
`gen-sdd-help-skills.js`, `check-skills-drift.js`, `check-artifact-guides.js`).

**Archive slimming** — git history is the durable archive: terminal state is committed
before archiving, ephemeral `archive/` dirs are local-only and gitignored, and
ephemeral artifacts mint collision-free 7-hex hash IDs so parallel branches never
collide (design: `.sdd/design/archive-slimming/`, shipped in v0.1.6+).

**Worker handoff & ergonomics** — `spawn-sdd-worker` delegates the execution phase to
an autonomous agent; `next` ranks candidate actions; `explain` builds persistent
projection documents; `projection-comments` processes feedback on them; an installable
statusline shows SDD state in Claude Code.

## In Flight

Active targets, roughly ordered by how settled they are:

- **TGT-125 — Hub auto-start with a single-instance guarantee** _(architecture)_
  A `SessionStart` hook probes `127.0.0.1:22351` and starts the hub (detached, behind a
  file lock) if it isn't running; the server's existing `EADDRINUSE` exit is the
  backstop. Approach is settled; implementation pending.
- **TGT-124 — README refresh + project roadmap** _(workflow)_
  Delivered by this document and the accompanying README rewrite.
- **TGT-123 — sdd-worker drives the full execution loop autonomously** _(workflow)_
  Today each execution skill ends with an interactive "Next:" footer; the worker should
  chain audit → decompose → close to completion on its own.
- **TGT-121 — Project north star** _(workflow)_
  A persistent, user-authored statement of the project's prime goal, surfaced to the
  agent at session-start; individual targets ladder up to it.
- **TGT-122 — Registry of drift-prone surfaces** _(workflow)_
  One tracked place that enumerates every derived surface (skills table, sdd-help,
  guides, this roadmap, …), its source of truth, and the check that catches drift.
- **sdd-explain design** _(design doc, no target yet — `.sdd/design/sdd-explain/`)_
  Interactive explainer agent that builds projection documents collaboratively with
  live Hub updates; `/sdd:explain` and projections shipped, the collaborative-agent
  design is not fully realised.

## Later / Aspirational

- **TGT-095 — Organic knowledge base for the worker** _(knowledge-base)_
  A graph + semantic-search store the worker queries before searching the codebase and
  writes back what it learns. Opens a new domain; storage tech, access surface, and
  staleness handling are all open decisions.
- **Design→target linkage** — targets carrying a `design:` frontmatter reference back
  to the design doc that spawned them (deferred in `.sdd/later.md`).
- **Feature-as-projection** — cross-cutting capability views over spec items whose
  domain axis doesn't match the capability axis (deferred in `.sdd/later.md`).
- **Structured target directories** — targets carrying additional data as a directory,
  like spec subject subdirs (deferred in `.sdd/later.md`).

# sdd:explain — Design Spec
_2026-06-01_

## Problem

Specs describe what must be true, but they don't explain how a system works as a whole. When working in an unfamiliar area (e.g. the permissions model), there is no way to get a synthesized explanation that combines spec invariants with code-level detail and persists that explanation for later review in the Hub.

## Solution

A skill `/sdd:explain <subject>` that spawns a dedicated `sdd-explainer` agent, writes a projection document to `.sdd/projections/<subject>.md`, and (in interactive mode) builds the document collaboratively with the user turn by turn. The Hub surfaces projections with live updates as the file is written.

---

## Skill: `/sdd:explain <subject>`

### Spawn

Creates team `sdd-explain-{project-slug}`, spawns agent named `sdd-explainer` (general-purpose, sonnet). User is responsible for ensuring only one explainer runs per session.

### First action

Agent asks one question: **interactive or non-interactive?**

Then immediately writes the projection file header so the Hub shows something:

```markdown
# {Subject}
_2026-06-01 · exploring..._
```

---

## Modes

### Interactive

The agent builds the document collaboratively across turns:

1. Writes the **main concept** section — specs first (search `.sdd/specs/` for relevant items), then code entry points. Writes each as it discovers it — the file grows progressively.
2. Sends user a message: what was covered, what branches are visible, what to explore next.
3. User replies directly to `sdd-explainer` with direction ("go deeper on middleware", "add detail to the spec items section").
4. Agent writes the next section or edits an existing one. Hub updates.
5. Repeat until user shuts down the agent.

The user can redirect mid-session — including asking for more detail on a section already written.

### Non-interactive

Agent traverses autonomously:
1. Specs → relevant spec items written as authoritative ground truth
2. Code entry points → key files and their roles
3. Key components → how they interact
4. Edge cases and open questions

Writes everything in one pass, marks document `_complete_`, shuts down.

---

## Output file

**Path:** `.sdd/projections/<subject>.md`

**Format:** free-form markdown. No fixed schema beyond the header line. Agent decides sections based on what it finds. Example shape:

```markdown
# Permissions model
_2026-06-01 · complete_

## Spec items
- **SPEC-auth-003** — ...
- **SPEC-rbac-001** — ...

## Overview
[main concept prose]

## Middleware
[how permissions are enforced at the request layer]

### Role hierarchy
[details added when user directed]

## API enforcement
[how individual endpoints check permissions]
```

---

## Hub: Projections screen

New screen in the Hub sidebar, between Specs and Gaps.

**Left panel:** list of `.sdd/projections/*.md` files, sorted by last modified. Each row shows subject name and timestamp.

**Right panel:** selected projection rendered as markdown. Auto-refreshes when the file changes — powered by the existing chokidar → WebSocket broadcast chain (already live for `.sdd/` changes). No polling needed.

**Live update behavior:** in interactive mode, each section the agent writes triggers a chokidar event (200ms debounce) → WebSocket broadcast → frontend re-renders. The user watching the Hub sees the document build in real time.

---

## Traversal approach (both modes)

The agent decides what to explore based on what it finds — not a fixed schema. The natural order:

1. **Specs first** — search `.sdd/specs/` for items related to the subject. These are the authoritative invariants. Always the starting point.
2. **Code entry points** — grep/glob for files related to the subject.
3. **Follow references** — read each file, follow imports/calls that are relevant. Write a subsection per component.
4. **Stop conditions** — a branch stops when: already covered, trivially simple, or out of scope for the subject.

Depth is naturally bounded by Claude's judgment. A `max_depth` parameter can be added to the skill if runaway exploration becomes an issue in practice.

---

## Out of scope (for now)

- Detecting or preventing multiple explainer agents per session (user manages this)
- Tagging spec items with `feature:` for aggregation (separate concern, tracked in `.sdd/later.md`)
- Projection staleness detection or regeneration prompts

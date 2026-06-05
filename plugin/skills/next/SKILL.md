---
name: next
description: This skill should be used when the user invokes `/sdd:next`, says "what should I do next", "what's the next step", "recommend a next action", "prioritise SDD work", or wants a ranked list of candidate next actions across all domains with priority, recommendation, and size signals, and then routes the chosen action to the appropriate skill.
version: 0.1.0
---

# SDD Next — Prioritised Next Action

Survey `.sdd/` state, rank candidate next actions by priority, recommendation,
and size, present them to the user, and route the selected action to the
matching SDD skill. The user selects; the agent routes.

## Input

No argument required. Run at any time to get a prioritised view of what to do
next across all domains. The state survey reuses the same reading logic as
`session-start` — it does not maintain a separate state model.

## Procedure

### 1. Survey the current state

Perform the same state collection as `session-start` steps 2–3:

- `.sdd/targets/*.md` — parse id, status, domain
- `.sdd/specs/{domain}/SPEC-*.md` — count active items, coverage fraction
- `.sdd/gaps/*.md` — parse id, spec-item, domain, status
- `.sdd/work-items/*.md` — parse id, gap-id, domain, status
- `.sdd/issues/*.md` — count open issues by domain
- `.sdd/improvements/*.md` — count open improvements by domain

**Do not duplicate this logic.** If the state was already collected during the
current `session-start` run, reuse that view rather than re-reading all files.

### 2. Generate candidate actions

For each artifact type with actionable state, generate one or more candidate
actions. Annotate each with three signals:

**Priority** (`P1` | `P2` | `P3`) — urgency based on SDD state:
- `P1` — Targets awaiting user input; blocked work items; stale audit warnings
- `P2` — Open gaps without work items; pending work items; in-progress work items
- `P3` — Uncovered spec items; open issues/improvements; no open gaps (healthy)

**Recommendation** (`★★★` | `★★` | `★`) — agent's judgment of value:
- `★★★` — highest-leverage next step (closes a gap, unblocks a pipeline stage)
- `★★` — valuable but not the bottleneck
- `★` — maintenance / hygiene action

**Size** (`S` | `M` | `L`) — effort/scope estimate derived heuristically:
- `S` — single-file change, one work item, one spec item
- `M` — one domain, 2–5 work items, or a cross-artifact move
- `L` — multiple domains, 6+ work items, or a structural change

**Routing** — the SDD skill to invoke for this action:
- Target engagement → `/sdd:target-engage TGT-{id}`
- Spec audit → `/sdd:spec-audit {domain}`
- Gap decomposition → `/sdd:gap-to-work-items {domain}`
- Work item close → `/sdd:work-item-close WI-{id}`
- Spec test → `/sdd:spec-test {domain}`
- Review issues → `/sdd:review-issues {domain}`
- Review improvements → `/sdd:review-improvements {domain}`
- Issue engage → `/sdd:review-engage ISS-{id}`

### 3. Rank and present candidates

Sort candidates:

1. By priority ascending (`P1` first)
2. Within priority: by recommendation descending (`★★★` first)
3. Within recommendation: by size ascending (`S` first)

Present at most **7 candidates** (to keep the list scannable). If more exist,
note `… and N more — run /sdd:session-start for full state`.

Format:

```
## Recommended Next Actions — 2026-05-12

P1 ★★★ S  1. Close work item WI-auth-001 — Add MFA check to admin handler
              → /sdd:work-item-close WI-auth-001
              Reason: In-progress work item; closing it unblocks the auth pipeline.

P1 ★★  M  2. Engage target TGT-009 — Rate limiting on public endpoints
              → /sdd:target-engage TGT-009
              Reason: Awaiting your input; agent has questions.

P2 ★★★ S  3. Close work item WI-auth-002 — Clear token cache on logout
              → /sdd:work-item-close WI-auth-002
              Reason: Pending; closes the last open gap in authentication domain.

P2 ★★  M  4. Audit API domain spec — 5 active items, no gap audit yet
              → /sdd:spec-audit api
              Reason: Spec items exist but codebase has never been audited against them.

P3 ★   S  5. Add spec tests for SPEC-auth-003
              → /sdd:spec-test authentication
              Reason: 1 uncovered spec item in authentication domain.

---
Pick a number (1–5), or press Enter to skip:
```

### 4. Route the selection

When the user selects an action (by number or by typing the skill invocation
directly), invoke the corresponding skill with its arguments. Do not auto-apply
the action without user selection.

If the user presses Enter or types "skip", print the full `session-start` state
and stop.

### 5. Zero-state handling

If `.sdd/` does not exist, print:

```
No .sdd/ directory found. Run /sdd:init to start.
```

### 6. All-clear handling

If there are no actionable items (no targets, gaps, or work items), print:

```
## Recommended Next Actions — 2026-05-12

All clear — no open targets, gaps, or work items.

P3 ★   M  1. Review authentication domain for issues
              → /sdd:review-issues authentication
              Reason: No open work; proactive review is the next valuable step.

---
Pick a number (1–1), or press Enter to skip:
```

## Constraints

- **User selects; agent routes.** Never auto-invoke a skill without user selection.
- **Reuse session-start state.** Do not maintain a separate state model; read
  from the same sources `session-start` uses.
- **Size is heuristic.** Derive it from artifact type and counts:
  - A single work item → `S`
  - An audit across one domain → `M`
  - A cross-domain or structural change → `L`
- **At most 7 candidates.** Long lists reduce the value of prioritisation.
- **Priority is SDD-state-driven.** It must reflect actual artifact states, not
  the agent's preference. Recommendation is the agent's judgment layer.

## Schema Reference

For artifact file schemas, ID conventions, and state machines:
`references/schemas.md`

For pipeline overview and skill responsibilities:
`references/sdd-pipeline.md`

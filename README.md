# SDD — Spec-Driven Development Plugin

Shift the workflow from telling agents what to do toward declaring what must be true.
Agents find the gaps and close them.

## The Core Idea

Instead of telling the agent **what to do**, declare **what must be true**. The agent
finds where reality diverges from the declaration and closes the gaps. This produces:

- A stable spec that survives many iterations
- A traceable audit trail from intent → spec → gap → fix
- Work items scoped to a specific divergence, not a vague task

## The Pipeline

```
Write a target → negotiate it → fold into spec → audit codebase → decompose gaps → close work items
```

Terminal state: no open gaps, no pending work items.

## The Four Artifacts

All state lives under `.sdd/` at the project root:

| Directory | Purpose | Who writes it |
|---|---|---|
| `.sdd/targets/` | User-written intent. Negotiated in-document. | User (agent responds) |
| `.sdd/specs/` | Canonical, structured specifications. The source of truth. | Agent (from targets) |
| `.sdd/gaps/` | Audit reports — where the codebase diverges from the spec. | Agent (from audit) |
| `.sdd/work-items/` | Scoped tasks that close gaps. | Agent (from gaps) |

**Specs are durable** — they never archive. Everything else has an `archive/`
subdirectory; terminal-state artifacts move there immediately, preserving provenance
via frontmatter references back to the spec.

## Skills

| Skill | Invoke | Purpose |
|---|---|---|
| Init | `/sdd:init [intent]` | Bootstrap `.sdd/` directory structure |
| Help | `/sdd:help` | Explain the workflow and all skills |
| Session Start | `/sdd:session-start` | Status snapshot — start every session here |
| Target Engage | `/sdd:target-engage TGT-XXX` | Negotiate a target or fold it into spec |
| Spec Audit | `/sdd:spec-audit {domain}` | Find gaps between codebase and spec |
| Gap to Work Items | `/sdd:gap-to-work-items {domain}` | Decompose gaps into actionable tasks |
| Work Item Close | `/sdd:work-item-close WI-XXX` | Implement a work item including tests |
| Spec Test | `/sdd:spec-test {domain}` | Generate integration tests for spec items, linked back into the spec |
| Spec Collapse | `/sdd:spec-collapse` | Propose structural cleanup of spec files |

## Getting Started

```
/sdd:init add two-factor authentication for admin actions
/sdd:target-engage TGT-001
# [answer agent questions in TGT-001.md, flip status to awaiting-agent]
/sdd:target-engage TGT-001       # agent proposes Current statement, flips to ready
/sdd:target-engage TGT-001       # agent folds into spec, archives target
/sdd:spec-audit authentication   # find gaps in codebase
/sdd:gap-to-work-items authentication
/sdd:work-item-close WI-auth-001
/sdd:session-start               # check remaining state
```

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
| Gap | `closed`, `accepted`, `deferred` | `open` |
| Work item | `done`, `abandoned` | `pending`, `in-progress`, `blocked` |

Note: `blocked` work items stay active and visible in `session-start` — they need a
decision, not burial.

## Design Decisions

**One file per artifact (gaps and work-items).** Archiving is a file move, not an edit.
This makes terminal-state transitions atomic and reversible.

**Alias-at-read for spec-collapse.** When spec items are merged or renamed, old IDs
become aliases in the surviving item's status line. Existing gap files are never
updated — resolution happens at read time by scanning for the alias. Spec-collapse is
safely rejectable with no cascade writes required.

**Content hash for spec versioning.** Each spec file carries a `version` field computed
as `grep -v "^version:" SPEC-domain.md | shasum -a 256 | cut -c1-8`. Stripping the
version line before hashing avoids a circular dependency. Session-start uses this to
detect stale gap audits.

**Atomic writes in target-engage.** Dialog entry and status flip happen in a single file
edit with no confirmation step. Prevents half-written state.

**~3 round soft cap in target-engage.** After round 3, the agent commits to a best-effort
Current statement rather than continuing to ask clarifying questions.

**Conflict files as siblings.** When a ready target contradicts the spec, a
`.sdd/targets/TGT-007.conflict.md` file is created alongside the target. The user
resolves it and deletes the file, then re-runs `target-engage`.

## Artifact Schemas

Full schemas, ID conventions, and state machines: [`references/schemas.md`](references/schemas.md)

Pipeline overview and skill responsibilities: [`references/sdd-pipeline.md`](references/sdd-pipeline.md)

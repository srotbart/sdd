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
| Explain | `/sdd:explain` | Use when the user invokes `/sdd:explain <subject>`, asks to "explain how X works", "document X", "write an explanation of X", or wants a deep-dive document on a component, concept, or subsystem in the current project |
| Gap To Work Items | `/sdd:gap-to-work-items` | says "decompose gaps into work items", "create work items for GAP-auth", "generate work items from gap report", "break down gaps for authentication", or wants to turn open gap files into actionable work items |
| Install Statusline | `/sdd:install-statusline` | invokes `/sdd:install-statusline` or asks to "install the SDD statusline", "set up the statusline", or "add SDD statusline to Claude Code" |
| Next | `/sdd:next` | says "what should I do next", "what's the next step", "recommend a next action", "prioritise SDD work", or wants a ranked list of candidate next actions across all domains with priority, recommendation, and size signals, and then routes the chosen action to the appropriate skill |
| Review Engage | `/sdd:review-engage` | says "engage issue ISS-auth-001", "engage improvement IMP-auth-001", "discuss this finding", "accept this issue", "dismiss this improvement", "what should I do about ISS-X", or wants to interactively decide what to do with an issue or improvement artifact |
| Review Improvements | `/sdd:review-improvements` | says "find improvements", "suggest refactors", "what can be simplified", "propose enhancements", or wants a 3-agent team to propose improvements — enhancements, refactors, simplifications, performance, ergonomics, better patterns |
| Review Issues | `/sdd:review-issues` | says "run a code review", "find issues in the codebase", "sweep for problems", "review domain X for issues", or wants a 3-agent team to flag code bugs, anti-patterns, smells, and spec problems and write them as issue artifacts |
| Sdd Help | `/sdd:sdd-help` | says "how does SDD work", "explain spec-driven development", "what is the SDD workflow", "how do I use SDD", "explain the SDD pipeline", "what are SDD skills", or wants to understand spec-driven development before starting or when confused about the workflow |
| Sdd Init | `/sdd:sdd-init` | says "initialize SDD", "set up SDD", "create the SDD folder", "bootstrap SDD for this project", or wants to start using spec-driven development in a project that has no `.sdd/` directory yet |
| Session Start | `/sdd:session-start` | says "start my SDD session", "show SDD state", "what's pending in SDD", "what targets are waiting", "check my SDD", or begins work on a spec-driven project and wants a status snapshot |
| Spawn Sdd Worker | `/sdd:spawn-sdd-worker` | Use when the user invokes `/sdd:spawn-sdd-worker`, says "spawn the sdd worker", "start the sdd worker", "hand off execution to the worker", or wants to delegate the execution phase (spec-audit, gap creation, work item closure) to an autonomous agent for a given domain |
| Spec Audit | `/sdd:spec-audit` | says "audit the spec", "audit authentication spec", "check the codebase against spec", "find gaps in SPEC-auth", "run a gap audit", "audit SPEC-auth-003", or wants to know where the codebase diverges from a spec |
| Spec Collapse | `/sdd:spec-collapse` | says "collapse the spec", "consolidate spec items", "merge spec items", "clean up the spec", "spec is getting messy", or wants to propose structural reorganisation of spec files |
| Spec Test | `/sdd:spec-test` | says "write tests for the spec", "add spec tests for authentication", "cover SPEC-auth-001 with a test", "generate integration tests for the spec", "which spec items have no tests", or wants to add automated test coverage to spec items |
| Target Engage | `/sdd:target-engage` | says "engage target TGT-XXX", "respond to this target", "process this target", "reconcile TGT-XXX with spec", "fold target into spec", or otherwise asks the agent to act on a target file in the SDD workflow |
| Work Item Close | `/sdd:work-item-close` | says "close work item WI-auth-001", "implement WI-auth-001", "work on WI-auth-001", "close the next work item", or wants to implement a specific work item including tests |

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

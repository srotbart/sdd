---
name: sdd-help
description: This skill should be used when the user invokes `/sdd:sdd-help`, says "how does SDD work", "explain spec-driven development", "what is the SDD workflow", "how do I use SDD", "explain the SDD pipeline", "what are SDD skills", or wants to understand spec-driven development before starting or when confused about the workflow.
version: 0.1.0
---

# SDD Help

Explain the spec-driven development workflow, its philosophy, and how to use
each skill. Tailor the depth to what the user asked — a first-time explanation
should be different from a quick reference.

## The Core Idea

Spec-driven development inverts the usual agent workflow.

Instead of telling the agent **what to do**, declare **what must be true**.
The agent finds where reality diverges from the declaration and closes the gaps.

This produces:
- A stable spec that survives many iterations
- A traceable audit trail from intent → spec → gap → fix
- Work items that are scoped to a specific divergence, not a vague task

## The Four Artifacts

Everything lives under `.sdd/` at the project root.

| Directory | What it contains | Who writes it |
|---|---|---|
| `targets/` | Intent declarations — negotiated in-document | User (agent responds) |
| `specs/` | Canonical invariants — the source of truth | Agent (from targets) |
| `gaps/` | Where the codebase diverges from the spec | Agent (from audit) |
| `work-items/` | Scoped tasks to close specific gaps | Agent (from gaps) |

Specs are **durable** — they never archive. Everything else archives when done,
preserving provenance via frontmatter references.

## The Pipeline

```
1. Write a target       →  .sdd/targets/TGT-001.md
2. Negotiate it         →  /sdd:target-engage TGT-001
3. Fold into spec       →  /sdd:target-engage TGT-001  (when status: ready)
4. Audit the codebase   →  /sdd:spec-audit authentication
5. Decompose gaps       →  /sdd:gap-to-work-items authentication
6. Close work items     →  /sdd:work-item-close WI-auth-001
7. Check state          →  /sdd:session-start
```

Terminal state: no open gaps, no pending work items.

## The Six Skills

### `/sdd:session-start`
Start every session with this. Scans `.sdd/` and prints a status snapshot
grouped by urgency. The most important line is how many targets are awaiting
your input. Also flags stale gap reports (spec changed since last audit).

### `/sdd:target-engage [TGT-id]`
Acts on a target based on its status:

- **`awaiting-agent`** — appends a dialog entry (clarifying questions or a
  proposed Current statement edit) and flips to `awaiting-user`. Soft cap of
  ~3 rounds; commits to a best-effort statement rather than asking forever.
- **`ready`** — reconciles the target with the spec: no-op, extension, or
  conflict. Conflicts surface as `.sdd/targets/TGT-id.conflict.md` for review.
  Never auto-merges.

The Dialog section is append-only. The Current statement can be edited by
either party. Status flips coordinate turn-taking.

### `/sdd:spec-audit [domain or SPEC-item-id]`
Enumerates code paths relevant to a spec item, reasons about whether each
invariant holds, and writes gap files for every divergence. Every gap includes
a `file:line` location and a one-line justification. Holds are shown alongside
gaps — the audit is only credible if it demonstrates what passed.

Gap files are stamped with the spec version hash so stale audits are detectable.

### `/sdd:gap-to-work-items [domain or GAP-id]`
Decomposes open gap files into scoped work items. Handles:
- One gap → one work item (default)
- One gap → many work items (fix requires distinct steps)
- Many gaps → one work item (same root cause)

Every work item includes a file-level scope and acceptance criteria with at
least one test criterion.

### `/sdd:work-item-close [WI-id]`
Implements a single work item end-to-end: reads acceptance criteria, makes the
code change, writes tests, verifies the test suite passes, then marks the work
item done and closes the linked gap. Both archive immediately.

One work item per invocation. Tests are not optional.

### `/sdd:spec-collapse`
Periodic structural cleanup. Analyses spec files for redundancy, overlap, or
items that should be split. Produces a consolidation proposal file — never
auto-applies changes. Handles ID aliasing so existing gaps remain valid after
merges.

### `/sdd:sdd-init [optional: first intent]`
One-time setup. Creates the `.sdd/` directory structure. Optionally scaffolds
a first target from the supplied intent.

## Target Status Lifecycle

```
draft → awaiting-agent → awaiting-user → ready → accepted → [archive]
                                                ↘ archived → [archive]
```

- **User flips to `awaiting-agent`** when they want a response
- **Agent flips to `awaiting-user`** after responding, or to `ready` when done
- **Either party flips to `ready`** when the target is settled
- **`accepted`** means folded into spec — archived automatically
- **`archived`** means abandoned — archived automatically

## Typical First Session

```
/sdd:sdd-init add two-factor authentication for admin actions
/sdd:target-engage TGT-001       # agent asks clarifying questions
# [user answers in TGT-001.md, flips status to awaiting-agent]
/sdd:target-engage TGT-001       # agent proposes Current statement, flips to ready
/sdd:target-engage TGT-001       # agent folds into spec, archives target
/sdd:spec-audit authentication   # finds gaps in codebase
/sdd:gap-to-work-items authentication
/sdd:work-item-close WI-auth-001
/sdd:session-start               # check remaining state
```

## Schema Reference

For artifact file formats, frontmatter fields, ID conventions, and state machines:
`references/schemas.md`

For pipeline overview and skill responsibilities table:
`references/sdd-pipeline.md`

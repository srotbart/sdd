---
name: review-improvements
description: This skill should be used when the user invokes `/sdd:review-improvements`, says "find improvements", "suggest refactors", "what can be simplified", "propose enhancements", or wants a 3-agent team to propose improvements — enhancements, refactors, simplifications, performance, ergonomics, better patterns. The team writes IMP-{domain}-{seq} artifacts but never auto-applies changes.
version: 0.1.0
---

# SDD Review Improvements

Spawn a team of 3 agents via `TeamCreate` to sweep the codebase and specs for
improvement opportunities — enhancements, refactors, simplifications, performance,
ergonomics, and better patterns. Each proposal is written as an `IMP-{domain}-{seq}`
artifact under `.sdd/improvements/`. This is the enhancement-focused sibling of
`/sdd:review-issues`. **The team never auto-applies improvements.**

## Input

Accept one of:

- **Domain name**: `authentication` — propose improvements for this domain
- **Path or glob**: `src/auth/` — review a specific area
- **No argument**: sweep the entire codebase and all spec domains

## Procedure

### 1. Spawn the improvements team

Use `TeamCreate` to spawn exactly **3 improvement-focused agents**. Assign each
agent a disjoint improvement lens to avoid duplicate coverage:

- **Agent A** — refactoring and simplification: duplicated code, over-complex
  logic, abstractions that could be extracted or collapsed
- **Agent B** — performance and ergonomics: inefficient patterns, poor APIs,
  confusing interfaces, unnecessary complexity in the public surface
- **Agent C** — architecture and patterns: structure improvements, better design
  patterns, missed opportunities for consistency with the spec/domain model

Each agent independently produces a list of improvement proposals.

### 2. Collect and de-duplicate proposals

Gather proposals from all three agents. Before writing any improvement files,
de-duplicate across agents:

- Two proposals are duplicates when they reference the same location and the same
  root improvement (even if described differently).
- For duplicate proposals, keep the one with the most specific benefit statement.
  Add a note: `(also proposed by Agent X)`.
- A proposal with a different location is always distinct, even if the pattern
  is similar.

### 3. Write improvement files

For each distinct proposal, create `.sdd/improvements/IMP-{domain}-{seq}.md`
using the next available sequence number for the domain.

**Required frontmatter:**

```markdown
---
id: IMP-auth-001
domain: authentication
status: open     # open | accepted | dismissed
location: "src/auth/session.py:45"
effort: medium   # low | medium | high
impact: high     # low | medium | high
discovered: "2026-05-12T14:30:00Z"
engaged-by: null  # WI-{abbrev}-{seq} or IMP-engage invocation when engaged
---
```

**Required body:**

```markdown
# Improvement: <short title>

**Location:** `file:line` (or `path/to/dir/`)
**What:** <one concise sentence describing the improvement>
**Where:** `file:line` or broader scope
**Benefit:** <one sentence on the expected benefit — what gets better>
**Effort/Impact:** effort: low/medium/high · impact: low/medium/high
```

**Effort/Impact guidance:**
- `effort: low` — a few lines, no interface change
- `effort: medium` — one module, may require callers to adapt
- `effort: high` — cross-cutting change, significant refactor

- `impact: high` — meaningfully improves readability, performance, or correctness
- `impact: medium` — noticeable improvement in one area
- `impact: low` — minor ergonomic improvement

**The team never auto-applies improvements.** Writing the artifact is the only
output. Whether to act is the user's decision after engaging with `/sdd:issue-engage`.

### 4. Report

```
## Improvements Review — authentication — 2026-05-12

### Agent A: Refactoring (2 proposals)
- IMP-auth-001: Extract shared token-validation helper  [src/auth/]  effort:medium impact:high
- IMP-auth-002: Collapse 3 identical session-check guards  [src/auth/api.py:120]  effort:low impact:medium

### Agent B: Performance/Ergonomics (1 proposal)
- IMP-auth-003: Replace linear token scan with hash lookup  [src/auth/session.py:45]  effort:low impact:high

### Agent C: Architecture (1 proposal)
- IMP-auth-004: Align refresh-token model with SPEC-auth-002 invariant  [src/auth/]  effort:medium impact:high

### De-duplicated (0 duplicates)

---
4 improvements written.
Next: Engage proposals with the user. Run `/sdd:issue-engage IMP-auth-001` to proceed.
```

## Constraints

- **Three agents via TeamCreate.** Exactly 3 improvement-focused agents. If
  TeamCreate is unavailable, complete the review serially and note the limitation.
- **Focus on enhancements, not defects.** Bugs and correctness issues belong to
  `/sdd:review-issues`. Boundary: if the code is wrong, it is an issue; if it is
  correct but improvable, it is an improvement.
- **Never auto-apply.** Agents propose; they do not modify code or spec files.
- **One proposal = one improvement.** Do not combine multiple improvements into
  one artifact.
- **Effort and impact must be explicit.** Every improvement must have both fields set.
- **De-duplicate before writing.** Write only distinct proposals; note duplicates.

## Artifact Storage

Improvements live at `.sdd/improvements/IMP-{domain}-{seq}.md`.
Archived improvements (accepted/dismissed) move to `.sdd/improvements/archive/`.

**ID convention:** `IMP-{domain-abbrev}-{seq}` — sequential within domain, globally
stable. IDs are never recycled.

**Terminal states → archive:** `accepted`, `dismissed`
**Active states:** `open`

Engagement (dismissal or acceptance) is handled by `/sdd:issue-engage`, not by
this skill.

## Shared Mechanics with Issues

The improvements artifact shares the same mechanics as the issues artifact
(SPEC-wf-025): storage layout with `archive/`, de-duplication across team,
in-document engagement via `/sdd:issue-engage`, and terminal-state archival.
The distinction is intent: issues flag defects; improvements propose enhancements.

## Schema Reference

For artifact file schemas, ID conventions, and cross-reference chain:
`references/schemas.md`

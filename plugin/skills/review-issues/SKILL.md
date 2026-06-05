---
name: review-issues
description: This skill should be used when the user invokes `/sdd:review-issues`, says "run a code review", "find issues in the codebase", "sweep for problems", "review domain X for issues", or wants a 3-agent team to flag code bugs, anti-patterns, smells, and spec problems and write them as issue artifacts. Never auto-fixes findings.
version: 0.1.0
---

# SDD Review Issues

Spawn a team of 3 agents via `TeamCreate` to sweep the codebase and specs for
problems. Each reviewer flags distinct findings as `ISS-{domain}-{seq}` artifacts
under `.sdd/issues/`. Findings are de-duplicated before archival. **Reviewers
never auto-fix issues.**

## Input

Accept one of:

- **Domain name**: `authentication` — review code and specs for this domain
- **Path or glob**: `src/auth/` — review a specific area
- **No argument**: review the entire codebase and all spec domains

## Procedure

### 1. Spawn the reviewer team

Use `TeamCreate` to spawn exactly **3 reviewer agents**. Assign each reviewer a
disjoint subset of the review surface to avoid duplicate coverage:

- **Reviewer A** — code correctness: bugs, logic errors, error-handling gaps,
  security anti-patterns
- **Reviewer B** — code quality: style violations, code smells, duplicated logic,
  naming issues, test coverage gaps
- **Reviewer C** — spec alignment: spec items that are ambiguous, incomplete,
  missing, or inconsistent with the codebase; anti-patterns in `.sdd/` artifacts

Each reviewer independently produces a list of findings with the fields below.

### 2. Collect and de-duplicate findings

Gather findings from all three reviewers. Before writing any issue files,
de-duplicate across reviewers:

- Two findings are duplicates when they reference the same file:line and the same
  root problem (even if described differently).
- For duplicate findings, keep the one with the most specific reasoning. Add a
  note: `(also flagged by Reviewer X)`.
- A finding with a different location is always a distinct issue, even if the
  problem is similar.

### 3. Write issue files

For each distinct finding, create `.sdd/issues/ISS-{domain}-{seq}.md` using the
next available sequence number for the domain.

**Required frontmatter:**

```markdown
---
id: ISS-auth-001
domain: authentication
status: open     # open | accepted | dismissed
location: "src/auth/admin.py:142"
severity: medium   # low | medium | high
discovered: "2026-05-12T14:30:00Z"
reviewed-by: null  # WI-{abbrev}-{seq} or ISS-engage invocation when engaged
---
```

**Required body:**

```markdown
# Issue: <short title>

**Location:** `file:line`
**Problem:** <one concise sentence describing the specific problem>
**Rationale:** <one sentence explaining why this is a problem and what the risk is>
**Severity:** low | medium | high
```

**Severity guidance:**
- `high` — correctness bug, security vulnerability, data corruption risk
- `medium` — anti-pattern, code smell, significant style violation, confusing API
- `low` — minor style nit, naming suggestion, low-priority improvement

**Reviewers never auto-fix.** Writing an issue is the only output. The fix is
the user's decision after engaging the issue with `/sdd:review-engage`.

### 4. Report

```
## Issue Review — authentication — 2026-05-12

### Reviewer A: Code Correctness (3 findings)
- ISS-auth-001: execute() called without null check  [src/auth/admin.py:142]  high
- ISS-auth-002: Race condition in session invalidation  [src/auth/session.py:87]  high

### Reviewer B: Code Quality (2 findings)
- ISS-auth-003: Token validation duplicated in 3 places  [src/auth/]  medium

### Reviewer C: Spec Alignment (1 finding)
- ISS-auth-004: SPEC-auth-002 does not cover refresh token expiry  [.sdd/specs/]  low

### De-duplicated (1 duplicate removed)
- ISS-auth-003 also flagged by Reviewer A as "copy-paste token check"

---
5 issues written (1 duplicate removed).
Next: Engage findings with the user. Run `/sdd:review-engage ISS-auth-001` to proceed.
```

## Constraints

- **Three reviewers via TeamCreate.** The skill must use exactly 3 agents, not
  fewer. If TeamCreate is unavailable, complete the review serially and note the
  limitation in the report.
- **Never auto-fix.** Reviewers flag; they do not modify code or spec files.
- **One issue = one finding.** Do not combine multiple problems into one issue.
  If three functions have the same bug, that is three issues (unless one fix
  closes all three, in which case note the shared root cause).
- **Severity must be explicit.** Every issue must have a severity field set.
- **De-duplicate before writing.** Write only distinct issues; note duplicates in
  the report.

## Artifact Storage

Issues live at `.sdd/issues/ISS-{domain}-{seq}.md`.
Archived issues (accepted/dismissed) move to `.sdd/issues/archive/`.

**ID convention:** `ISS-{domain-abbrev}-{seq}` — sequential within domain, globally
stable. IDs are never recycled.

**Terminal states → archive:** `accepted`, `dismissed`
**Active states:** `open`

Engagement (dismissal or acceptance) is handled by `/sdd:review-engage`, not by
this skill.

## Schema Reference

For artifact file schemas, ID conventions, and cross-reference chain:
`references/schemas.md`

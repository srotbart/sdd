---
name: issue-engage
description: This skill should be used when the user invokes `/sdd:issue-engage`, says "engage issue ISS-auth-001", "engage improvement IMP-auth-001", "discuss this finding", "accept this issue", "dismiss this improvement", "what should I do about ISS-X", or wants to interactively decide what to do with an issue or improvement artifact. Mirrors the target-engage flow; outcomes are a spec change or a new gap, or dismissal with provenance.
version: 0.1.0
---

# SDD Issue Engage

Read an issue (`ISS-*`) or improvement (`IMP-*`) artifact, engage it in-document
with the user, and reach a terminal decision: **accepted** (creates a spec change
or a new gap) or **dismissed** (archived with provenance). This is an intent-phase
activity — the human must sign off. The agent never auto-applies findings.

This skill mirrors the `target-engage` flow exactly: dialog is appended in-document,
status flips coordinate turn-taking, and the outcome always leaves a provenance trail.

## Input

Accept one of:

- **Issue ID**: `ISS-auth-001` — engage a specific issue
- **Improvement ID**: `IMP-auth-001` — engage a specific improvement
- **No argument**: list open issues and improvements grouped by domain; prompt
  the user to pick one

## Status-Based Branching

| Status | Action |
|---|---|
| `open` | Start engagement — append first dialog entry, flip to `awaiting-user` |
| `awaiting-agent` | Append a dialog entry and response, flip to `awaiting-user` |
| `awaiting-user` | It is the user's turn. Report and wait — do not append |
| `accepted` / `dismissed` | Terminal. Report and stop — nothing to do |

---

## Procedure

### 1. Read the artifact file

Parse frontmatter (`id`, `status`, `location`, `severity` or `effort`/`impact`)
and the body (Location, Problem/What, Rationale/Benefit).

Confirm the artifact is a valid issue (`ISS-*`) or improvement (`IMP-*`). If the
file is not found or is already in `archive/`, report and stop.

### 2. First engagement (status: `open`)

On first engagement:

1. Append a Dialog section to the artifact file (if not already present):
   ```markdown
   ## Dialog
   ### 2026-05-12 — Agent
   [Agent summary + initial recommendation: accept/dismiss with reasoning]
   ```
2. Include a recommendation: should this become a spec change, a gap, or be dismissed?
   State the reasoning in one or two sentences.
3. Flip `status: awaiting-user`.

All writes are atomic (dialog entry + status flip in one edit).

### 3. Continuing engagement (status: `awaiting-agent`)

Append a new dialog entry responding to the user's input. If the user has
indicated a direction (accept/dismiss), propose the concrete action (which spec
item to create/edit, or which gap to open). Flip to `awaiting-user` after responding.

Soft cap ~3 rounds. After the cap, commit to a recommendation rather than
continuing to ask.

### 4. Terminal decisions

#### Accepted as spec change

When the user accepts an artifact as requiring a spec item change:

1. Append a dialog entry confirming the spec change.
2. Make the spec change: create a new spec item or update an existing one.
   Follow the spec item writing procedure in `references/artifacts/spec.md`.
3. Set `status: accepted`, set `engaged-by: {spec-item-id}` (or note the change).
4. Move the artifact file to `archive/` (`.sdd/issues/archive/` or `.sdd/improvements/archive/`).

#### Accepted as new gap

When the user accepts an artifact as revealing a genuine codebase divergence:

1. Append a dialog entry confirming the gap creation.
2. Write a new gap file following the gap schema in `references/artifacts/gap.md`.
   Set `spec-item` to the relevant spec item. Set `reasoning` to a one-line
   justification derived from the issue/improvement body.
3. Set `status: accepted`, set `engaged-by: {gap-id}`.
4. Move the artifact file to `archive/`.

#### Dismissed

When the user dismisses an artifact (not actionable, out of scope, already
addressed, etc.):

1. Append a dialog entry recording the dismissal reason.
2. Set `status: dismissed`. Add a `dismissed-reason` line to frontmatter.
3. Move the artifact file to `archive/` with the dismissal reason preserved.

### 5. Report

```
## Issue Engaged — ISS-auth-001 — 2026-05-12

**Decision:** accepted as gap
**Outcome:** GAP-auth-007 written — "execute() called without null check at src/auth/admin.py:142"
**Artifact:** ISS-auth-001 → archived (accepted)

---
Next: Decompose the gap into a work item. Run `/sdd:gap-to-work-items GAP-auth-007` to proceed.
```

Or for dismissal:

```
## Issue Engaged — ISS-auth-003 — 2026-05-12

**Decision:** dismissed
**Reason:** Duplication is intentional — handlers are in separate security boundaries
**Artifact:** ISS-auth-003 → archived (dismissed)

---
Next: Continue engaging the next open issue. Run `/sdd:issue-engage ISS-auth-004` to proceed.
```

## Constraints

- **Intent-phase: human sign-off required.** The agent proposes; the user decides.
  Never accept or dismiss an artifact without explicit user confirmation.
- **Dialog is append-only.** Never edit or delete prior dialog entries.
- **Atomic writes.** Dialog entry and status flip happen in a single file edit.
- **Provenance is mandatory.** Every terminal transition (accepted/dismissed) must
  leave a `engaged-by` or `dismissed-reason` field so the decision is traceable.
- **No auto-fix.** This skill never modifies application code. If the outcome is
  a gap, the fix comes via the regular gap-to-work-items pipeline.
- **Soft dialog cap.** After ~3 rounds, commit to a recommendation rather than
  continuing indefinitely.

## Artifact Storage

- Issues: `.sdd/issues/ISS-{domain}-{seq}.md` → archive: `.sdd/issues/archive/`
- Improvements: `.sdd/improvements/IMP-{domain}-{seq}.md` → archive: `.sdd/improvements/archive/`

## Schema Reference

For artifact file schemas, ID conventions, and cross-reference chain:
`references/schemas.md`

For pipeline overview and skill responsibilities:
`references/sdd-pipeline.md`

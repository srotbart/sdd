---
name: spec-collapse
description: This skill should be used when the user invokes `/sdd:spec-collapse`, says "collapse the spec", "consolidate spec items", "merge spec items", "clean up the spec", "spec is getting messy", or wants to propose structural reorganisation of spec files. Produces a consolidation proposal artifact — never auto-applies changes.
version: 0.1.0
---

# SDD Spec Collapse

Analyse spec files for structural problems (redundancy, overlap, split items that
belong together, single items that should be split) and produce a consolidation
proposal as a file. Nothing is applied automatically. The proposal is reviewed and
applied manually, with aliasing to preserve ID stability.

## Input

Accept one of:

- **Domain name or spec file**: `authentication` — analyse one domain
- **No argument**: analyse all spec files
- **Explicit merge/split instruction**: "merge SPEC-auth-001 and SPEC-auth-002" —
  skip analysis, go straight to producing a proposal for the named operation

## Procedure

### 1. Read the spec file(s)

Glob `.sdd/specs/{domain}/SPEC-*.md` (skip `archive/`) for each domain being analysed.
Load all active spec items — parse frontmatter `id`, `status`, `version`, and the body.

### 2. Identify consolidation candidates

Look for:

**Merge candidates** — two or more items that:
- Assert the same invariant from different angles with no meaningful distinction
- Are always co-cited in gap reports (check `.sdd/gaps/*.md` for co-occurrence)
- Would be clearer as a single, broader statement

**Split candidates** — a single item that:
- Contains two independent invariants joined by "and"
- Is cited by gap entries that reference only one half of it
- Would produce cleaner gap reasoning if separated

**Rename/reword candidates** — items whose titles or statements have drifted from
what the codebase actually does, creating confusion during audits.

State the evidence for each candidate — do not propose on intuition alone.

### 3. Write the consolidation proposal

Create `.sdd/specs/COLLAPSE-{domain}-{date}.md`:

```markdown
---
domain: authentication
created: 2026-05-12T14:30:00Z
status: pending   # pending | applied | rejected
---

# Spec Collapse Proposal — Authentication — 2026-05-12

## Proposed merges

### Merge SPEC-auth-001 + SPEC-auth-002 → SPEC-auth-001
**Evidence:** Both items assert MFA requirements; all 4 gap reports citing either
item also cite the other. No audit has ever distinguished between them.

**Proposed unified statement:**
> All admin-privileged operations MUST verify a second factor before proceeding.
> The factor must be validated within the current session and must not be shared
> across devices or cached across logouts.

**Alias:** SPEC-auth-002 becomes an alias of SPEC-auth-001.
Existing gaps referencing SPEC-auth-002 remain valid via alias resolution.

**To apply:**
1. Replace the body of `.sdd/specs/authentication/SPEC-auth-001.md` with the unified statement; add `SPEC-auth-002` to its `aliases:` frontmatter field; recompute and update its `version` field
2. Move `.sdd/specs/authentication/SPEC-auth-002.md` to `.sdd/specs/authentication/archive/`

---

## Proposed splits

### Split SPEC-auth-005 → SPEC-auth-005 + SPEC-auth-007 (new)
**Evidence:** The item asserts both token expiry and token revocation. GAP-auth-009
references only the revocation half; GAP-auth-011 references only the expiry half.
Split produces cleaner gap-to-spec traceability.

**Proposed item A (retain SPEC-auth-005):**
> Session tokens MUST expire after 24 hours of inactivity.

**Proposed item B (new SPEC-auth-007):**
> Session tokens MUST be immediately invalidated on explicit logout.

**To apply:**
1. Rewrite the body of `.sdd/specs/authentication/SPEC-auth-005.md` with item A; recompute and update its `version` field
2. Create `.sdd/specs/authentication/SPEC-auth-007.md` as a new item file with its own frontmatter and computed `version`
3. Update any open gaps referencing SPEC-auth-005 to reference the correct item

---

## No action recommended

- SPEC-auth-003: Clear and self-contained. No consolidation needed.
- SPEC-auth-004: Distinct from all other items. No consolidation needed.
```

### 4. Report

Summarise the proposal:

```
## Spec Collapse Proposal — authentication — 2026-05-12

Proposal written to: .sdd/specs/COLLAPSE-authentication-20260512.md

1 merge proposed:  SPEC-auth-001 + SPEC-auth-002
1 split proposed:  SPEC-auth-005 → SPEC-auth-005 + SPEC-auth-007 (new)
2 items unchanged: SPEC-auth-003, SPEC-auth-004

Review the proposal, make any edits, then apply manually following the
"To apply" steps in each section. Delete the proposal file when done.
```

## Aliasing Rules

When a merge is applied:

- The surviving item keeps its original ID
- The merged item's ID is added to the surviving item's `Aliases:` annotation
- The merged item's `## SPEC-…` heading is deleted from the spec file
- Existing gaps referencing the merged ID remain valid — resolution finds the alias

When a split is applied:

- The original item retains its ID with the narrowed statement
- The new item gets the next available sequence number
- Existing gaps referencing the original ID remain valid (they cited the broader item)
- Newly generated gaps for the new item use the new ID

**Never update existing gap or work-item files as part of a collapse.** The proposal
must be safely rejectable without touching any gaps or work items.

## Constraints

- **Proposals only — never auto-apply.** Write the proposal file; do not edit any
  spec item until the user reviews and confirms.
- **Evidence required for every proposal.** "These seem similar" is not evidence.
  Co-citation in gap reports, textual overlap analysis, or explicit user instruction
  are evidence.
- **One proposal file per invocation.** If multiple domains are analysed, all
  proposals go into one file grouped by domain.
- **Preserve all active gaps.** A collapse proposal must never change gap file
  contents, status, or IDs.

## Schema Reference

For spec item schema, alias conventions, and version hash command:
`references/schemas.md`

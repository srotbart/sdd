---
name: spec-audit
description: This skill should be used when the user invokes `/sdd:spec-audit`, says "audit the spec", "audit authentication spec", "check the codebase against spec", "find gaps in SPEC-auth", "run a gap audit", "audit SPEC-auth-003", or wants to know where the codebase diverges from a spec. Enumerates relevant code paths, reasons about whether each spec item holds, and produces structured gap files stamped with the spec version.
version: 0.1.0
---

# SDD Spec Audit

Given a spec domain or a specific spec item, enumerate the relevant code paths,
reason about whether each invariant holds at each location, and write gap files
for every divergence found. Every claim includes a one-line justification.
Verifiability over vibes.

## Input

Accept one of:

- **Domain name or spec file**: `authentication` or `SPEC-authentication` — audit all
  active items in the domain
- **Spec item ID**: `SPEC-auth-003` — audit a single item only
- **No argument**: if a single spec domain exists, default to it; otherwise ask

## Procedure

### 1. Load the spec

Glob `.sdd/specs/{domain}/SPEC-*.md` and `.sdd/specs/{domain}/*/SPEC-*.md` (skip `archive/` at either level). Read each active item file —
parse frontmatter `id`, `status`, `version`, and the body. If auditing a single item,
filter to that item only.

Each active spec item body must contain `## Invariant` and `## Acceptance criteria`
sections (per SPEC-wf-017). The audit reasons against the `## Invariant` section. If
creating or updating a spec item file during audit, include both sections in order:
`## Invariant` (concise rule statement), then `## Acceptance criteria` (bullet list
of verifiable conditions).

Each item file's `version` field is its current hash. Record it per item — every gap
written for a given spec item carries that item's `version` value as `audit-spec-version`.

### 2. For each spec item, enumerate relevant code paths

For each item being audited:

a. **Extract keywords** from the item's statement — domain concepts, action verbs,
   entity names (e.g., "MFA", "second factor", "admin", "session token").

b. **Search the codebase** for those keywords:
   ```bash
   grep -rn "{keyword}" --include="*.{ext}" .
   ```
   Prioritise source files over tests, configs, and generated files.

c. **Expand from hits** — read surrounding context (the function, class, or module
   containing each hit) to understand the actual behavior. Follow call chains one
   level deep when the hit is in a dispatch layer.

d. **Identify the decision points** — the specific locations where the invariant is
   either enforced, violated, or not applicable. A decision point is a line where
   the code either does or fails to do what the spec requires.

Stop expanding when additional paths are clearly unrelated to the invariant. Record
the file and line number for every decision point considered.

### 3. Reason about each decision point

For each decision point, make a binary determination:

**Holds** — the code at this location correctly implements or enforces the spec item.
Write one line: `file:line — holds: [one-line reason]`

**Gap** — the code at this location violates, bypasses, or fails to implement the
spec item. Write one line: `file:line — gap: [one-line reason]`

**Not applicable** — the code is in scope but this spec item does not constrain it.
No entry needed.

The one-line reason must be specific enough for a future reader to verify without
re-reading the code. "Calls execute() without checking MFA status" is good.
"Doesn't handle auth" is not.

### 4. Check for existing gap files

Before writing new gaps, scan `.sdd/gaps/GAP-{abbrev}-*.md` for existing open gaps
referencing the same spec item.

- **Existing open gap, still a gap**: update its `audit-spec-version` to the current
  hash. Do not change its ID, location, or reasoning unless the location has moved —
  in which case update `file:line` and append a note to the reasoning.
- **Existing open gap, now holds**: close it — set `status: closed`, set `closed-by`
  to the empty string (no work item closed it; the code was fixed outside the pipeline),
  and move the file to `.sdd/gaps/archive/`.
- **New gap**: write a new gap file (see step 5).

### 5. Write new gap files

For each new gap found, create `.sdd/gaps/GAP-{abbrev}-{seq}.md` using the next
available sequence number for the domain.

Use the schema in `references/schemas.md` (Gaps section). Set:
- `spec-item` — the spec item ID
- `status: open`
- `discovered` — current ISO timestamp
- `audit-spec-version` — the hash computed in step 1
- `closed-by: null`
- `deferred-reason: null`

The body must contain:
- `**Location:** file:line` — the primary decision point
- `**Reasoning:** [one-line justification]`

If a single gap spans multiple locations (e.g., the same enforcement is missing in
three separate handlers), create one gap file and list all locations:

```markdown
**Locations:**
- `src/auth/admin.py:142`
- `src/auth/batch.py:87`
- `src/auth/api.py:231`

**Reasoning:** All three entry points call execute() without verifying MFA status.
```

### 6. Report the audit results

Print a summary:

```
## Spec Audit — SPEC-auth — 2026-05-12

### SPEC-auth-001 — Admin actions require two-factor verification
- src/auth/admin.py:142  gap: execute() called without MFA check  → GAP-auth-001 (new)
- src/auth/batch.py:87   gap: batch handler bypasses MFA entirely  → GAP-auth-002 (new)
- src/auth/api.py:231    holds: mfa_required decorator present

### SPEC-auth-002 — Session tokens must not persist beyond logout
- src/auth/session.py:87  gap: cache.clear_token() not called on logout  → GAP-auth-003 (existing, refreshed)
- src/auth/session.py:102 holds: db.invalidate_token() called

---
2 new gaps, 1 existing gap refreshed, 2 locations hold.
Next: Decompose gaps into work items. Run `/sdd:gap-to-work-items {domain}` to proceed.
```

Show holds alongside gaps — the audit is only credible if it demonstrates what was
checked, not just what failed.

The final line after `---` is conditional on the outcome:
- **Gaps found:** `Run \`/sdd:gap-to-work-items {domain}\` to decompose into work items.`
- **No gaps found:** `Run \`/sdd:spec-test {domain}\` to add test coverage.`

Substitute the actual domain abbreviation (e.g., `architecture`, `auth`) for `{domain}`.

## Constraints

- **One-line reasoning is mandatory.** Never write a gap without a justification.
  If the reasoning requires more than one line, the gap is probably two gaps.
- **Never fabricate locations.** Only report `file:line` entries that were actually
  read during this session. If search returns nothing, say so explicitly:
  `No code paths found for this item — either not yet implemented or search terms
  need refinement.`
- **Stamp every gap with the spec version.** `audit-spec-version` must be set on
  every gap written or updated.
- **Do not close gaps that reference work items.** If an existing gap has a
  non-null `closed-by`, leave it alone — work-item-close manages that transition.
- **Preserve existing gap IDs.** Never renumber or reassign gap IDs, even if the
  gap file content is updated.

## Schema Reference

For gap file schema, spec version hash command, and ID conventions:
`references/schemas.md`

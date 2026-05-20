---
name: gap-to-work-items
description: This skill should be used when the user invokes `/sdd:gap-to-work-items`, says "decompose gaps into work items", "create work items for GAP-auth", "generate work items from gap report", "break down gaps for authentication", or wants to turn open gap files into actionable work items. Takes a domain or specific gap ID as input and produces scoped work-item files.
version: 0.1.0
---

# SDD Gap to Work Items

Read open gap files for a domain (or a single gap), decompose them into concrete
scoped work items, and write work-item files. Handles one-gap-to-many and
many-gaps-to-one decomposition. Separate from spec-audit so audits can be accepted
independently of decomposition.

## Input

Accept one of:

- **Domain name**: `authentication` — decompose all open gaps for the domain
- **Gap ID**: `GAP-auth-003` — decompose a single gap
- **No argument**: if a single domain has open gaps, default to it; otherwise ask

## Procedure

### 1. Load open gaps

Read all active `.sdd/gaps/GAP-{abbrev}-*.md` for the target scope. Filter to
`status: open`. Skip gaps that already have work items — check by scanning
`.sdd/work-items/WI-{abbrev}-*.md` for entries referencing each gap ID.

### 2. Determine decomposition strategy per gap

For each open gap without existing work items, decide on decomposition:

**One work item per gap (default):** The gap is at a single location and the fix is
self-contained. One work item, one gap-id reference.

**One gap → many work items:** The gap spans multiple locations or the fix requires
distinct sequential steps (e.g., add enforcement in handler A, add enforcement in
handler B, add integration test). Create one work item per discrete step. Each work
item references the same gap ID.

**Many gaps → one work item:** Multiple gaps share the same root cause and the fix
closes all of them in a single change (e.g., three missing null checks fixed by
extracting a shared validation helper). Create one work item referencing all gap IDs.
List all `gap-id` values in the work item frontmatter as an array.

State the decomposition choice and reasoning before writing any files.

### 3. Write work-item files

For each work item, create `.sdd/work-items/WI-{abbrev}-{seq}.md` using the next
available sequence number for the domain.

Use the schema in `references/schemas.md` (Work Items section). Set:
- `gap-id` — the referenced gap ID (or an array for many-to-one)
- `status: pending`
- `created` — current ISO timestamp
- `abandoned-reason: null`

The body must contain:

**Scope** — one line identifying the file(s) and the specific change needed.
Be concrete enough that a developer can start without reading the gap file.

**Acceptance criteria** — a short bulleted checklist. Every work item must include
at least one test criterion. Example:

```markdown
**Scope:** `src/auth/admin.py` — add MFA verification before `execute()`

**Acceptance criteria:**
- MFA check present at the entry point of every admin action handler
- Unit test: request without valid second factor is rejected
- Unit test: request with valid second factor proceeds normally
```

### 4. Report

```
## Gap Decomposition — authentication — 2026-05-12

### GAP-auth-001 (one-to-many: 2 work items)
- WI-auth-001: Add MFA check to admin handler  [src/auth/admin.py]
- WI-auth-002: Add MFA check to batch handler  [src/auth/batch.py]

### GAP-auth-002 (one-to-one)
- WI-auth-003: Add MFA check to API handler  [src/auth/api.py]

### GAP-auth-003 + GAP-auth-004 (many-to-one: shared root cause)
- WI-auth-004: Extract shared token-validation helper  [src/auth/]
  Reason: both gaps are fixed by the same helper extraction

---
4 work items created. Run `/sdd:work-item-close WI-auth-001` to start.
```

## Constraints

- **Every work item needs at least one test criterion.** Implementation without
  verification is not done.
- **Scope must be a file path, not a description.** "Fix the auth module" is not a
  scope. `src/auth/admin.py:142` is.
- **Do not create work items for non-open gaps.** Closed, accepted, and deferred
  gaps are in archive/; skip them entirely.
- **Do not duplicate work items.** If a gap already has a work item referencing it,
  skip that gap and note it in the report.
- **Many-to-one requires explicit justification.** State why the same change closes
  multiple gaps before grouping them.

## Schema Reference

For work-item schema, gap schema, and ID conventions:
`references/schemas.md`

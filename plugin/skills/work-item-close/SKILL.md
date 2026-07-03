---
name: work-item-close
description: This skill should be used when the user invokes `/sdd:work-item-close`, says "close work item WI-auth-001", "implement WI-auth-001", "work on WI-auth-001", "close the next work item", or wants to implement a specific work item including tests. Implements the work item, verifies acceptance criteria, marks it done, and archives both the work item and its gap.
version: 0.1.0
---

# SDD Work Item Close

Implement a single work item end-to-end: read the acceptance criteria, make the
code change, verify tests pass, then mark the work item done and close the linked
gap. One work item per invocation.

## Input

Accept a work item ID: `WI-auth-001`. If not provided, suggest the highest-priority
active work item (prefer `in-progress` over `pending`, `pending` over `blocked`).

## Procedure

### 1. Read the work item

Parse `.sdd/work-items/WI-{abbrev}-{seq}.md`. Extract:
- `gap-id` (may be a single ID or an array)
- `status` — must be `pending` or `in-progress`; if `done` or `abandoned`, report and stop
- Scope and acceptance criteria from the body

### 2. Read the linked gap(s)

For each gap ID referenced, read `.sdd/gaps/GAP-{abbrev}-{seq}.md`. Confirm `status: open`.
The gap's `**Location:**` and `**Reasoning:**` are the ground truth for what needs fixing.

When resolving the gap's `spec-item` field to read the spec item file, search both
`.sdd/specs/{domain}/SPEC-*.md` and `.sdd/specs/{domain}/*/SPEC-*.md`, excluding
`archive/` at either level.

### 3. Flip work item to in-progress

Update `status: in-progress` in the work item frontmatter before making any code changes.

### 4. Implement the change

Make the minimal code change that satisfies the acceptance criteria. Follow the
scope in the work item — do not expand to adjacent cleanup or refactoring.

Read the gap's reasoning line as the implementation target. The fix is done when
the reasoning no longer applies — not when the code "looks better."

### 5. Implement the tests

Write tests covering every test criterion in the acceptance criteria. At minimum:
one test for the failure path (gap behaviour absent) and one for the success path
(gap behaviour present and correct).

Do not mark work items done without tests. If the codebase has an established test
pattern for this area, match it.

### 6. Verify

Run the work item's tests (unit and integration):
```bash
# adjust to project's test runner
pytest {test_file}        # Python
npm test -- {test_file}   # Node
go test ./...             # Go
```

If tests fail, fix them before proceeding. Do not proceed to step 7 with red tests.

Also run the linked spec item's tests if a `**Tests:**` block exists in the spec:

```bash
# extract test identifiers from the spec item's **Tests:** block, then run them
pytest tests/integration/test_admin.py::test_SPEC_auth_001_admin_rejected_without_mfa
```

If the spec item has no `**Tests:**` block, note it in the report: "SPEC-auth-001
has no spec-level tests — consider running /sdd:spec-test after this work item closes."
Do not block archiving on missing spec tests; only block on failing ones.

### 6b. Verify acceptance criteria and cross-domain compliance

**"Tests pass" alone is not completion.** Before marking the work item done:

- **Re-read the gap's spec item `## Acceptance criteria` and verify each bullet
  against the code** — not merely that the test suite is green. A criterion that no
  test happens to exercise must still be confirmed by reading the implementation.
  If any criterion is not actually satisfied, keep working — do not flip to done.
- **Cross-domain self-check.** When this skill is invoked from `sdd:close-domain`
  (SPEC-wf-040), self-check the diff against **every cross-domain spec item provided
  in context**, not only the gap's own spec item. The code a work item touches is
  often governed by spec items from other domains; a change that closes its own gap
  while violating another domain's invariant is not done. If the diff conflicts with
  a provided cross-domain item, resolve it before proceeding (or surface it, per the
  close-domain guardian rules).

Proceed to mark the work item done only once every acceptance criterion is verified
against the code and the diff is clean against all provided cross-domain items.

### 6c. Scope backfill — mechanical write to the spec item (permitted)

After the implementation diff is final, back-fill or refine the governing spec
item's `scope:` field from the actual diff. This is a mechanical write — not
subject to the escalation rule for spec item edits (SPEC-wf-038):

1. Derive globs from the files changed by this work item.
2. If the spec item has no `scope:` field, add one with the derived globs;
   if it already has one, extend it to cover any paths not yet included.
3. Recompute the spec item's `version:` hash (SHA-256 of the full file content,
   first 8 hex chars) and update it.
4. Include the scope backfill in the terminal-state commit (step 8).

**Never touch `## Invariant` or `## Acceptance criteria` content.** Scope backfill
modifies only the frontmatter `scope:` field and `version:` hash.

### 7. Mark work item done and close the linked gap(s)

In one edit to the work item file, set `status: done`. For each linked gap, set
`status: closed` and `closed-by: {work-item-id}`. If the work item referenced
multiple gaps (many-to-one), close all of them.

### 8. Commit the terminal state, then archive

Ephemeral archives are gitignored local-only caches (SPEC-wf-035), so a `mv` into
`archive/` reads to git as a plain deletion. Order matters — **write terminal state
→ commit → `mv`**:

1. Commit the implementation, the tests, and the terminal work-item and gap files
   at their active paths, with a message naming the WI and closed gap IDs.
2. Move the work item file to `.sdd/work-items/archive/` and each gap file to
   `.sdd/gaps/archive/`.

Never stage or commit files under an ephemeral `archive/` path. Committing the
terminal state before the move keeps git history a complete record; recover an
archived artifact with `git log --diff-filter=A -- <path>` +
`git show <sha>:<path>`. The guarantee holds under a merge-commit strategy —
squash-merging or rebasing the artifact commit away would erase artifacts created
and closed within a single branch.

### 9. Report

```
## Work Item Closed — WI-auth-001 — 2026-05-12

**Change:** src/auth/admin.py:142 — added mfa_required check before execute()
**Tests:** tests/auth/test_admin.py — 2 new tests (absent path, present path)
**Gap closed:** GAP-auth-001 → archived
**Work item:** WI-auth-001 → archived

---
Next: Continue with the next work item or verify the domain. Run `/sdd:work-item-close WI-{next-id}` to proceed.
```

The final line after `---` is conditional on remaining work in the domain:
- **Work items remain:** `Run \`/sdd:work-item-close WI-{next-id}\` to continue.` (substitute the next pending/in-progress WI ID)
- **All work items closed:** `Run \`/sdd:spec-audit {domain}\` to verify the spec holds.` (substitute the domain name)

## Constraints

- **One work item per invocation.** Do not close multiple work items in a single run.
- **Tests are not optional.** Every criterion marked with "test" in the acceptance
  checklist must have a corresponding test. No exceptions.
- **Minimal scope.** The fix should make the reasoning line false. Nothing more.
  Resist the pull to improve surrounding code — create a separate target if needed.
- **Verify before archiving.** Do not archive the work item until the test suite passes.
- **Do not close gaps with a non-null `closed-by`.** If a gap already has a
  `closed-by` value, it was closed by a different work item. Report the anomaly
  rather than overwriting.
- **Blocked work items need a resolution first.** If the work item is `blocked`,
  report the blocking reason and ask the user how to proceed. Do not attempt to
  implement around the blocker.
- **Spec items require Invariant and Acceptance criteria sections.** If this skill
  ever writes a spec item file, the body must contain `## Invariant` and
  `## Acceptance criteria` sections in order after the title heading.

## Schema Reference

For work-item and gap schemas, terminal states, and archive conventions:
`references/schemas.md`

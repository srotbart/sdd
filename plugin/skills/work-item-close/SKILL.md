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

### 7. Mark work item done and archive

In one edit to the work item file:
- Set `status: done`

Move the work item file to `.sdd/work-items/archive/`.

### 8. Close the linked gap(s)

For each linked gap:
- Set `status: closed`
- Set `closed-by: {work-item-id}`

Move the gap file to `.sdd/gaps/archive/`.

If the work item referenced multiple gaps (many-to-one), close and archive all of them.

### 9. Report

```
## Work Item Closed — WI-auth-001 — 2026-05-12

**Change:** src/auth/admin.py:142 — added mfa_required check before execute()
**Tests:** tests/auth/test_admin.py — 2 new tests (absent path, present path)
**Gap closed:** GAP-auth-001 → archived
**Work item:** WI-auth-001 → archived

Run `/sdd:session-start` to see updated state.
```

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

## Schema Reference

For work-item and gap schemas, terminal states, and archive conventions:
`references/schemas.md`

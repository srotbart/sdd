# Work Item Artifact Guide

A **work item** is a scoped implementation task generated from one or more gaps.
It captures exactly what to change, in which file(s), and what tests must pass
before the item is considered done. Work items are produced exclusively by
`gap-to-work-items`; they are never human-written.

---

## 1. Schema / ID Convention

**File path:** `.sdd/work-items/WI-{abbrev}-{seq}.md`
**ID pattern:** `WI-{abbrev}-{seq}` — abbreviation matches the spec domain
(e.g., `auth`, `wf`); sequence is globally stable within the domain.

**Required frontmatter:**

```markdown
---
id: WI-auth-001
gap-id: GAP-auth-001          # single ID, or array for many-to-one: [GAP-auth-001, GAP-auth-002]
domain: authentication
status: pending               # pending | in-progress | done | blocked | abandoned
created: "2026-05-12T15:00:00Z"
abandoned-reason: null        # reason string when abandoned; null until then
---
```

**Required body:**

```markdown
# Work Item: <short title>

**Scope:** `path/to/file.py` — <one-line description of the change>

**Acceptance criteria:**
- <criterion 1>
- Unit test: <failure path> → <expected outcome>
- Unit test: <success path> → <expected outcome>
```

---

## 2. Lifecycle

```
pending → in-progress → done      → [archive]
        ↘ blocked     → pending   → in-progress → done → [archive]
        ↘ abandoned               → [archive]
```

| State | Meaning |
|---|---|
| `pending` | Not yet started |
| `in-progress` | Agent is implementing |
| `done` | Implemented, tests pass — **terminal, archive** |
| `blocked` | Waiting on a prerequisite |
| `abandoned` | Cancelled — **terminal, archive** |

---

## 3. Valid State Transitions

| From | To | Who | Trigger |
|---|---|---|---|
| `pending` | `in-progress` | Agent | Work begins |
| `pending` | `blocked` | Agent | Prerequisite discovered |
| `pending` | `abandoned` | User/Agent | Cancelled |
| `in-progress` | `done` | Agent | Tests pass, acceptance criteria met |
| `in-progress` | `blocked` | Agent | Prerequisite discovered mid-implementation |
| `blocked` | `pending` | User/Agent | Blocker resolved |
| `blocked` | `abandoned` | User/Agent | Cancelled |
| `done` | — | — | Terminal; no further transitions |
| `abandoned` | — | — | Terminal; no further transitions |

---

## 4. Operating Procedure

### Implementing a work item

1. Read the work item file: extract `gap-id`, `status`, scope, acceptance criteria.
2. Confirm `status` is `pending` or `in-progress`; stop if `done` or `abandoned`.
3. Read each linked gap file; confirm `status: open`.
4. Flip `status: in-progress` before making any code changes.
5. Make the minimal code change that satisfies the acceptance criteria.
   The reasoning line on the gap is the implementation target — the fix is done
   when the reasoning no longer applies.
6. Write tests for every test criterion in the acceptance criteria. At minimum:
   one test for the failure path (gap behaviour absent) and one for the success
   path (gap behaviour present and correct).
7. Run the tests and confirm they pass. Do not proceed with red tests.
8. Set `status: done` and move the work item file to `.sdd/work-items/archive/`.
9. For each linked gap: set `status: closed`, `closed-by: {WI-id}`,
   move to `.sdd/gaps/archive/`.

### Handling a blocked work item

Report the blocking reason to the user. Do not attempt to implement around the
blocker. Wait for user direction before proceeding.

### Abandoning a work item

Set `status: abandoned`, set `abandoned-reason` to a brief explanation, and
move the file to `.sdd/work-items/archive/`. The linked gap remains `open` — a
new work item may reference it later if needed.

---

## 5. Invariants and Discipline

- **Tests are not optional.** Every acceptance criterion marked with "test" must
  have a corresponding test. No exceptions. Work items are not done without tests.
- **Minimal scope.** The fix makes the gap's reasoning line false. Nothing more.
  Resist the pull to improve surrounding code.
- **Flip to in-progress before writing code.** The status must be `in-progress`
  before any code change is made, so concurrent readers see the work is claimed.
- **Verify before archiving.** Do not archive until the test suite passes.
- **Do not close gaps with a non-null `closed-by`.** Verify before closing.
- **Many-to-one decomposition requires justification.** When one work item closes
  multiple gaps, the justification for grouping must be stated explicitly.

---

## 6. Edge Cases

**Work item already done/abandoned:** Report and stop — do not re-implement.

**Blocked work item:** Report the blocking reason; ask the user how to proceed.
Do not implement around the blocker.

**Gap already closed:** If the work item's linked gap has `status: closed` and
a non-null `closed-by`, report the anomaly — do not overwrite the existing closer.

**Spec item has no `**Tests:**` block:** Note it in the report and suggest running
`/sdd:spec-test` after closing. Do not block archiving on missing spec tests;
only block on failing tests.

**Many-to-one: one test set, multiple gaps:** All linked gaps are closed in the
same step. Confirm all are `open` before starting; close and archive all together
after the tests pass.

**Abandoned gap gets a new work item:** The new work item must reference the same
original gap ID (which is still open). Never reassign gap IDs.

---

## See Also

- `plugin/references/schemas.md` — ID conventions and cross-reference chain
- `plugin/references/sdd-pipeline.md` — full pipeline and skill responsibilities
- `plugin/skills/gap-to-work-items/SKILL.md` — produces work item files
- `plugin/skills/work-item-close/SKILL.md` — operating skill for work items

# Gap Artifact Guide

A **gap** is an audit finding — a specific location in the codebase where the
code diverges from, fails to implement, or contradicts a spec item's invariant.
Gaps are produced exclusively by `spec-audit`; they are never human-written.
Each gap records exactly one divergence with a one-line justification.

---

## 1. Schema / ID Convention

**File path:** `.sdd/gaps/GAP-{abbrev}-{seq}.md`
**ID pattern:** `GAP-{abbrev}-{seq}` — abbreviation matches the spec domain
(e.g., `auth`, `wf`); sequence is globally stable within the domain.

**Required frontmatter:**

```markdown
---
id: GAP-auth-001
spec-item: SPEC-auth-001
domain: authentication
status: open          # open | closed | accepted | deferred
discovered: "2026-05-12T14:30:00Z"
audit-spec-version: "a3f9c812"   # version of spec item at time of audit
closed-by: null       # WI-{abbrev}-{seq} when closed; null until then
deferred-reason: null # reason string when deferred; null until then
---
```

**Required body:**

```markdown
# Gap: <short title>

**Location:** `file:line`
**Reasoning:** <one-line justification>
```

For gaps spanning multiple locations:

```markdown
**Locations:**
- `src/auth/admin.py:142`
- `src/auth/batch.py:87`

**Reasoning:** <one-line justification covering all locations>
```

---

## 2. Lifecycle

```
open → closed    → [archive]   (closed by a work item)
open → accepted  → [archive]   (accepted as-is, no fix needed)
open → deferred  → [archive]   (deferred with stated reason)
```

| State | Meaning |
|---|---|
| `open` | Active divergence; needs a work item |
| `closed` | Fixed by a work item; `closed-by` set to WI ID |
| `accepted` | Acknowledged divergence; accepted as-is |
| `deferred` | Not acted on now; `deferred-reason` explains why |

---

## 3. Valid State Transitions

| From | To | Who | Trigger |
|---|---|---|---|
| `open` | `closed` | Agent (work-item-close) | Work item implementation verified |
| `open` | `accepted` | User | Intentional divergence accepted |
| `open` | `deferred` | User | Deferred; reason recorded |
| `closed` | — | — | Terminal; no further transitions |
| `accepted` | — | — | Terminal; no further transitions |
| `deferred` | — | — | Terminal; no further transitions |

**Gaps with a non-null `closed-by` must not be closed again.** If `closed-by` is
already set, report the anomaly rather than overwriting.

---

## 4. Operating Procedure

### Writing a new gap (spec-audit)

1. Identify the spec item being audited and record its current `version` field.
2. Locate the decision point: the file and line where the invariant is violated.
3. Write one line of reasoning explaining the violation specifically enough that
   a future reader can verify it without re-reading the code.
4. Assign the next sequential ID: `GAP-{abbrev}-{next-seq}`.
5. Set `audit-spec-version` to the spec item's current `version`.
6. Set `status: open`, `closed-by: null`, `deferred-reason: null`.

### Updating an existing gap (re-audit)

When a spec item's version changes (spec was edited), the gap's
`audit-spec-version` becomes stale. On re-audit:

- If the gap still exists: update `audit-spec-version` to the current spec version.
  Do not change the gap's ID, location, or reasoning unless the location has moved.
- If the gap no longer exists (fixed outside the pipeline): set `status: closed`,
  set `closed-by: ""` (empty string — no work item closed it), archive the gap.

### Closing a gap (work-item-close)

1. Set `status: closed` and `closed-by: {WI-id}`.
2. Move the file to `.sdd/gaps/archive/`.

---

## 5. Invariants and Discipline

- **One-line reasoning is mandatory.** A gap without a justification is not a
  valid gap. If reasoning requires more than one line, split into two gaps.
- **Never fabricate locations.** Only report `file:line` entries that were
  actually read during the audit session.
- **Stamp every gap with the spec version.** `audit-spec-version` must be set on
  every gap created or updated; it is the stale-detection mechanism.
- **Preserve gap IDs.** Never renumber or reassign gap IDs, even when updating.
- **Do not close gaps with a non-null `closed-by`.** Check before closing.
- **One gap = one divergence.** If the same enforcement is missing in three
  handlers, write one gap file listing all three locations (not three separate gaps)
  unless each handler's fix is independent enough to warrant a separate work item.

---

## 6. Edge Cases

**Stale gap:** `audit-spec-version` differs from the current `version` on the
spec item file. Run spec-audit to refresh before acting on the gap.

**Orphaned gap:** The referenced `spec-item` ID no longer exists in the active
or archive spec directories. Flag with a stale warning; do not auto-close. Verify
spec-collapse ran alias correctly.

**Gap already has a work item:** If a gap already has a `WI-*` in `closed-by`,
it has been closed by a different path. Do not overwrite; report the anomaly.

**Gap with `deferred-reason`:** A deferred gap is terminal. If the situation has
changed, the user must create a new gap (or a new spec item) rather than
re-opening the deferred one.

**Same fix closes multiple gaps:** When one work item's change addresses multiple
gaps, all of them are closed in the same work-item-close step. Each gap gets
`closed-by: {WI-id}` and all are archived together.

---

## See Also

- `plugin/references/schemas.md` — ID conventions and cross-reference chain
- `plugin/references/sdd-pipeline.md` — full pipeline and skill responsibilities
- `plugin/skills/spec-audit/SKILL.md` — produces gap files
- `plugin/skills/gap-to-work-items/SKILL.md` — decomposes gaps into work items
- `plugin/skills/work-item-close/SKILL.md` — closes gaps via work items

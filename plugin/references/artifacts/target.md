# Target Artifact Guide

The **target** is the entry point for all SDD work. It is user-written intent —
a statement of what the user wants to achieve — negotiated in-document with the
agent until both parties agree on a clear current statement that can be folded
into the spec.

---

## 1. Schema / ID Convention

**File path:** `.sdd/targets/TGT-{seq}.md`
**ID pattern:** `TGT-{seq}` — globally unique sequential number, never recycled.

**Required frontmatter:**

```markdown
---
id: TGT-007
status: awaiting-user   # see Lifecycle
created: 2026-05-12
domain: authentication  # the spec domain this target belongs to
---
```

Optional frontmatter:
- `design:` — name of a design document in `.sdd/design/` associated with this target

**Required body sections:**

```markdown
# Target: <short title>

## Current statement
[Authoritative target text — both parties may propose edits here]

## Dialog
### 2026-05-12 — User
[original intent]

### 2026-05-12 — Agent
[response]
```

---

## 2. Lifecycle

A target passes through the following states from creation to archival:

```
draft → awaiting-agent → awaiting-user → ready → accepted → [archive]
                                                ↘ archived → [archive]
```

| State | Who sets it | Meaning |
|---|---|---|
| `draft` | User | Being composed; not yet ready for agent response |
| `awaiting-agent` | User | User wants an agent response |
| `awaiting-user` | Agent | Agent responded; waiting for user input |
| `ready` | Either | Target is settled; no more dialog needed |
| `accepted` | Agent | Folded into spec — **terminal, archive** |
| `archived` | Either | Abandoned without folding — **terminal, archive** |

---

## 3. Valid State Transitions

| From | To | Who | Trigger |
|---|---|---|---|
| `draft` | `awaiting-agent` | User | User submits for response |
| `awaiting-agent` | `awaiting-user` | Agent | Agent appends dialog, has questions |
| `awaiting-agent` | `ready` | Agent | Agent proposes final current statement |
| `awaiting-user` | `awaiting-agent` | User | User responds, wants another round |
| `awaiting-user` | `ready` | User | User accepts current statement |
| `ready` | `accepted` | Agent | Agent folds into spec and archives |
| `ready` | `archived` | Either | Abandoned |
| Any active | `archived` | Either | Abandoned without folding |

**Invalid transitions:** `accepted → any`, `archived → any` (terminal states are final).

---

## 4. Operating Procedure

### Creating a target

Write a new file at `.sdd/targets/TGT-{next-seq}.md` with `status: draft`. Add
the initial intent in the Dialog section. When ready for agent response, flip
`status: awaiting-agent`.

### Engaging a target (`awaiting-agent`)

1. Read the full target file: frontmatter + Current statement + Dialog.
2. Count prior agent rounds (soft cap ~3). On the final round, commit to a
   best-effort Current statement rather than asking more questions.
3. Append a new Dialog entry (`### {date} — Agent`). Update the Current statement
   if proposing an edit.
4. Flip `status: awaiting-user` (or `ready` if the target is settled).
5. Commit all changes atomically (single edit to the file).

### Folding a ready target (`ready`)

1. Read the Current statement and all active spec items in the target's domain.
2. Determine the outcome:
   - **No conflict, extends spec:** Write new or updated spec item(s), archive target (`accepted`).
   - **Conflict with existing spec:** Write a `.conflict.md` file, keep target `ready`, stop.
   - **No-op (already covered):** Archive target (`accepted`), note in dialog.
3. Archive: move target file to `.sdd/targets/archive/`.

---

## 5. Invariants and Discipline

- **Dialog is append-only.** Never edit or delete prior dialog entries.
- **Current statement may be edited by either party.** It is the live negotiated text.
- **Soft dialog cap.** After ~3 agent rounds, commit to a Current statement.
  Infinite clarification is not acceptable.
- **Atomic writes.** Dialog entry and status flip happen in a single file edit.
- **Conflicts surface, never auto-merge.** A ready target that contradicts the spec
  produces a `.conflict.md` file; the spec is never silently modified.
- **Terminal states are irreversible.** `accepted` and `archived` targets move to
  `archive/` immediately and are never moved back.

---

## 6. Edge Cases

**Target already in archive:** If the ID resolves to `archive/TGT-{seq}.md`, the
artifact is terminal. Report and stop — nothing to do.

**Conflict with multiple spec items:** Create one `.conflict.md` file per blocking
spec item (one file per TGT-id + SPEC-id pair). Each file is deleted separately
after resolution.

**Missing `domain` frontmatter:** Infer the domain from the target's title or content
if possible; otherwise ask the user before proceeding to fold.

**Concurrent edits:** If another tool or session has modified the target since reading
it, re-read before writing to avoid clobbering changes.

**No active spec items in domain:** When folding into a new domain, create the domain
subdirectory under `.sdd/specs/` and write the first spec item there.

---

## See Also

- `plugin/references/schemas.md` — ID conventions and cross-reference chain
- `plugin/references/sdd-pipeline.md` — full pipeline and skill responsibilities
- `plugin/skills/target-engage/SKILL.md` — operating skill for targets

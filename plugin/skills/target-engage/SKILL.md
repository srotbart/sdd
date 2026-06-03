---
name: target-engage
description: This skill should be used when the user invokes `/sdd:target-engage`, says "engage target TGT-XXX", "respond to this target", "process this target", "reconcile TGT-XXX with spec", "fold target into spec", or otherwise asks the agent to act on a target file in the SDD workflow.
version: 0.1.0
---

# SDD Target Engage

Read the target file, determine the target's current status, and take the appropriate action.
All writes are atomic: dialog entry and status flip happen in a single edit.

## Status-Based Branching

| Status | Action |
|---|---|
| `awaiting-agent` | Append a dialog entry, flip to `awaiting-user` (or `ready`) |
| `ready` | Reconcile Current statement with spec |
| `draft` | Remind user to flip status to `awaiting-agent` when ready for a response |
| `awaiting-user` | It is the user's turn. Report and wait — do not append |
| `accepted` / `archived` | Artifact is in archive/. Nothing to do |

---

## Branch A: Engaging an `awaiting-agent` Target

### 1. Read the full target file

Parse frontmatter (`id`, `status`, `domain`, `created`) and both body sections: Current statement and Dialog.

### 2. Count prior agent rounds

Count `### YYYY-MM-DD — Agent` headers in the Dialog. This is the round number for the upcoming response.

### 3. Choose response type

**Round ≤ 2:**
Determine whether the Current statement and Dialog contain enough information to commit to a clear target. If not, ask the minimum set of clarifying questions needed to converge — one to three questions, no more.

**Round 3 or higher:**
Commit. Do not ask further questions. Propose a concrete Current statement edit that represents the best-effort synthesis of all dialog so far. State any remaining assumptions explicitly inline. Flip to `ready` rather than `awaiting-user`.

**Any round, if the target is already clear:**
Skip questions. Propose a Current statement edit directly and flip to `ready`.

### 4. Draft the dialog entry

Format:
```
### YYYY-MM-DD — Agent
[Response text. Either clarifying questions, or a proposed Current statement edit, or both.]
```

If proposing a Current statement edit, quote the proposed text explicitly:

```
Proposed Current statement:

> [full proposed text]

Accept this, or revise and flip status back to awaiting-agent.
```

### 5. Write the single atomic edit

In one file edit:
- Append the dated dialog entry to the Dialog section (append-only — never touch prior entries)
- Update `status` in frontmatter: `awaiting-user` if asking questions, `ready` if committing

Do not split this into two edits. Do not ask for confirmation before writing.

---

## Branch B: Reconciling a `ready` Target with the Spec

### 1. Read the target's Current statement

This is the authoritative statement of intent. Ignore the Dialog for reconciliation purposes.

### 2. Identify the relevant spec file

Use the target's `domain` frontmatter field to locate `.sdd/specs/{domain}/`. If no subdirectory exists for this domain, go to the **New domain** outcome below. Enumerate active spec items by globbing `.sdd/specs/{domain}/SPEC-*.md` and `.sdd/specs/{domain}/*/SPEC-*.md` (skip `archive/` at either level).

### 3. Reason about the relationship

Compare the Current statement against every active spec item in the domain. Classify the outcome:

**No-op:** The Current statement is fully covered by existing spec items. Nothing to add or change.

**Extension:** The Current statement adds new requirements not present in the spec. New spec items are needed.

**Conflict:** The Current statement directly contradicts one or more active spec items — the same behavior is required to be both present and absent, or two incompatible constraints are asserted.

**Ambiguous:** The Current statement partially overlaps with existing items in a way that could be extension or conflict depending on interpretation. Surface for review.

**New domain:** No spec file exists for this domain. A new spec file is needed.

### 4. Execute the outcome

#### No-op
- Flip the target's status to `accepted` in frontmatter
- Move the target file to `.sdd/targets/archive/`
- Report: which spec items already cover it

---
Next: Run `/sdd:spec-audit {domain}` to audit the updated spec.

#### Extension
- Create each new spec item as `.sdd/specs/{domain}/SPEC-{abbrev}-{seq}.md` using the schema in `references/schemas.md`
- Assign the next available `SPEC-{abbrev}-{seq}` IDs by scanning existing files in the domain subdirectory
- Each spec item body must follow this structure in order: `# {id} — {title}` heading, then `## Invariant` (concise statement of the rule or behavior), then `## Acceptance criteria` (plain bullet list of verifiable conditions). The optional `**Tests:**` block follows `## Acceptance criteria` when present.
- Compute and set `version` in each new item file's frontmatter using the hash command in `references/schemas.md` (Specs section)
- Flip the target's status to `accepted` in frontmatter
- Move the target file to `.sdd/targets/archive/`
- Report: which new spec items were added and their IDs

---
Next: Run `/sdd:spec-audit {domain}` to audit the updated spec.

#### Conflict
- Create a conflict file at `.sdd/targets/TGT-{id}.conflict.md` using the schema in `references/schemas.md` (Conflict Files section), with `conflict-type: contradiction`
- Leave the target's status as `ready` — do not modify the target file
- Do not write anything to the spec
- Report: conflict file created, what the user needs to decide

#### Ambiguous
- Create a conflict file using `conflict-type: overlap` — schema in `references/schemas.md` (Conflict Files section)
- Leave the target as `ready`
- Report: the overlap and why it needs a human decision

#### New domain
- Create `.sdd/specs/{domain}/` and `.sdd/specs/{domain}/archive/`
- Choose a short `abbrev` (3–6 chars, lowercase) derived from the domain name
- Write the initial spec items as individual files `.sdd/specs/{domain}/SPEC-{abbrev}-{seq}.md` using the schema in `references/schemas.md`
- Each spec item body must follow this structure: `# {id} — {title}` heading, then `## Invariant`, then `## Acceptance criteria` (bullet list), then optional `**Tests:**` block.
- Compute and set `version` in each item file's frontmatter
- Flip the target to `accepted` and archive it
- Report: new domain subdirectory created, abbreviation chosen, items added

---
Next: Run `/sdd:spec-audit {domain}` to audit the updated spec.

---

## Constraints

- **Dialog is append-only.** Never edit, reorder, or delete prior dialog entries.
- **Current statement is editable.** Both agent and user may propose rewrites. The agent always quotes the full proposed text explicitly in the dialog entry.
- **Never auto-merge conflicts.** If any part of the reconciliation is a conflict, stop and surface it. Do not write partial spec changes when a conflict exists.
- **One conflict file per blocking item.** If a target conflicts with multiple spec items, create one conflict file per conflicting pair.
- **Item version must be set on every write.** Compute and set the `version` field in each spec item file's frontmatter immediately after writing it.

## Schema Reference

For artifact schemas, ID conventions, and state transitions:
`references/schemas.md`

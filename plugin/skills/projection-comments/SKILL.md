---
name: projection-comments
description: Use when the user invokes `/sdd:projection-comments <name>`, says "address projection comments for <name>", "process comments on <name>", or wants to apply and prune pending comments on a projection document. Reads the co-located .comments.json, applies clarify/re-evaluate/expand/condense edits to the projection markdown, removes addressed entries, and leaves unaddressable entries in place.
version: 0.1.0
---

# SDD Projection Comments

Read a projection's pending comment entries, apply the requested action to the
corresponding text in the projection markdown, and prune successfully addressed
entries from the comments JSON. Entries that cannot be confidently addressed are
left in place rather than silently dropped.

## Input

Accept a required projection name argument: `/sdd:projection-comments overview`

The name becomes the filename stem:
- projection markdown: `.sdd/projections/<name>.md`
- comments JSON: `.sdd/projections/<name>.comments.json`

If no name is provided, list available projections in `.sdd/projections/` and ask
the user to pick one.

## Procedure

### 1. Read the projection and its comments

Read the projection markdown:

```bash
cat .sdd/projections/<name>.md
```

Read the co-located comments JSON (SPEC-arch-042):

```bash
cat .sdd/projections/<name>.comments.json
```

If the comments file is absent or empty, report "No pending comments for <name>."
and stop.

### 2. For each comment entry, apply the action

Entries carry: `id`, `action` (`clarify` | `re-evaluate` | `expand` | `condense`),
`selectedText`, `line`, `note`, `createdAt`.

Locate the relevant text in `<name>.md` using `selectedText` (and `line` as a hint
to disambiguate when the text appears more than once). Then apply the action:

- **clarify** — add a short clarification sentence or parenthetical immediately after
  the selected text, prefixed with a note marker (e.g. _[clarification: …]_). Use
  the `note` field to guide what needs to be clarified.
- **re-evaluate** — rewrite or substantially revise the sentence or paragraph
  containing `selectedText`. The `note` field states the concern to address.
- **expand** — elaborate the section around `selectedText` with more detail. Add
  prose, examples, or sub-points as appropriate. The `note` guides the direction.
- **condense** — shorten the sentence or paragraph containing `selectedText`.
  Preserve the core meaning while removing redundancy. The `note` may name specific
  parts to cut.

After applying an action, mark the entry as **addressed** (track locally — do not
write to the file mid-loop).

If the relevant text cannot be found (the projection may have changed) or the
required edit is ambiguous beyond a reasonable interpretation, mark the entry as
**unaddressable** and leave it in the comments JSON unchanged. Do not silently drop
an unaddressable entry.

### 3. Write the updated projection

Overwrite `.sdd/projections/<name>.md` with the edited content.

### 4. Write the pruned comments JSON

Remove only the addressed entries from the array. Keep all unaddressable entries
exactly as they were. Write the result back to `.sdd/projections/<name>.comments.json`
(or delete the file if the array is now empty).

The pruned JSON must be consistent with the format the Projections UI reads
(SPEC-arch-042): a plain JSON array of entries with `id`, `action`, `selectedText`,
`line`, `note`, `createdAt` fields.

### 5. Report

Print a summary:

```
## Projection comments — <name>

Addressed   (<n>): <list of ids + action>
Unaddressed (<m>): <list of ids + reason why each was skipped>

<name>.md updated.
<name>.comments.json pruned — <n> entr(y|ies) removed, <m> remaining.
```

## Constraints

- **Never silently drop an unaddressable entry.** If the text is not found, or the
  requested edit cannot be made with confidence, leave the entry in the JSON and
  report it as unaddressed.
- **Operate per projection only.** Do not read, write, or modify any other projection
  markdown or comments JSON.
- **Preserve markdown structure.** Edits must not break headers, code fences, lists,
  or other structural elements of the document.
- **The pruned JSON format must remain valid.** After writing, the array must parse
  correctly and each entry must retain all original fields unchanged (except the
  addressed entries, which are removed entirely).

---

Next: Run `/sdd:session-start` to review overall SDD state after applying projection comments.

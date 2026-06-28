---
id: SPEC-scr-053
domain: ui-screens
abbrev: scr
status: active
aliases: []
version: "02eaa91d"
---

# SPEC-scr-053 — Projection view supports selecting text and attaching typed comments

## Invariant

In the Projections view, the user can select text within a rendered projection and attach a
typed comment to it. Selecting text reveals a small marker icon next to the selection; clicking
the icon opens an action menu offering exactly **clarify**, **re-evaluate**, **expand**, and
**condense**, plus an optional small multiline note input. Confirming an action persists the
comment via the co-located comments API (SPEC-arch-042) with the selected text, the source line,
the action, and the note. Commented text renders highlighted with a tiny (~half-size) type
label aligned to the end/top of the last word of the highlighted text; hovering the commented
text shows the date/time the comment was added together with the comment text. The set of
highlights is driven by the persisted comments and updates reactively, so when an entry is
removed (addressed/pruned via SPEC-wf-034) its highlight disappears. The source line is derived
by locating the selected text within the raw markdown source (first occurrence, 1-based).
Multiple comments on the same or overlapping text are supported additively.

## Acceptance criteria

- Selecting text in a rendered projection shows a marker icon near the selection
- Clicking the marker opens a menu offering exactly: clarify, re-evaluate, expand, condense,
  plus an optional multiline note input (a hovering text box)
- Confirming an action persists an entry (selectedText, line, action, note, createdAt) via the
  comments API (SPEC-arch-042), co-located with the projection
- The `line` is derived by locating the selected text in the raw markdown source (first
  occurrence), 1-based
- Commented text renders highlighted with a tiny (~half-size) label at the end/top of the last
  word indicating the comment type
- Hovering commented text shows the date/time added and the comment text
- The highlight set reflects the persisted comments and updates reactively; a removed/pruned
  entry's highlight disappears
- Multiple / overlapping comments on the same text are supported (additive)

**Tests:**

- `hub/client/src/screens/Projections.test.tsx > Projections view — text-select comment feature (SPEC-scr-053) > action menu renders clarify, re-evaluate, expand, condense buttons` — the action menu shows all four action buttons
- `hub/client/src/screens/Projections.test.tsx > Projections view — text-select comment feature (SPEC-scr-053) > selecting an action reveals note input and confirm button` — selecting an action reveals the note field and confirm button
- `hub/client/src/screens/Projections.test.tsx > Projections view — text-select comment feature (SPEC-scr-053) > confirming an action calls PUT with the new entry and closes the menu` — confirm persists entry via PUT and closes the menu
- `hub/client/src/screens/Projections.test.tsx > Projections view — text-select comment feature (SPEC-scr-053) > line is derived from first occurrence of selectedText in raw markdown (1-based)` — line number is the 1-based position of selectedText in the markdown source
- `hub/client/src/screens/Projections.test.tsx > Projections view — text-select comment feature (SPEC-scr-053) > comments loaded from server are reflected in the component state` — existing comments are fetched on mount
- `hub/client/src/screens/Projections.test.tsx > Projections view — text-select comment feature (SPEC-scr-053) > renders a highlight <mark> for a comment whose selection is plain single-line text` — persisted comment selection is highlighted in the rendered content
- `hub/client/src/screens/Projections.test.tsx > Projections view — text-select comment feature (SPEC-scr-053) > highlights a selection that spans a soft-wrapped line (whitespace-normalized match)` — soft-wrapped selections match with whitespace normalization
- `hub/client/src/screens/Projections.test.tsx > Projections view — text-select comment feature (SPEC-scr-053) > derives the correct line when the selection spans a soft-wrapped line` — line derivation handles soft-wrapped phrases correctly
- `hub/client/src/screens/Projections.test.tsx > Projections view — text-select comment feature (SPEC-scr-053) > multiple comments on same selectedText are supported additively` — multiple comments on the same text are added cumulatively

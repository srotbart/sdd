---
id: WI-scr-053
gap-id: GAP-scr-050
domain: ui-screens
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement text-select comment feature in Projections view (SPEC-scr-053)

**Scope:** `hub/client/src/screens/Projections.tsx` and `Projections.css` — add text-selection detection that shows a marker icon near the selection; clicking opens a floating action menu with clarify/re-evaluate/expand/condense actions and an optional multiline note; confirming persists via `PUT /workspaces/:id/projections/:name/comments`; load comments on projection select and render highlights with type labels and hover tooltips; DELETE removes a comment; all reactive to persisted state.

**Acceptance criteria:**
- Selecting text in the rendered projection reveals a marker icon near the selection
- Clicking the marker opens an action menu with exactly: clarify, re-evaluate, expand, condense; plus an optional multiline note input
- Confirming persists an entry (id, selectedText, line, action, note, createdAt) via the comments API
- `line` is derived by finding selectedText in the raw markdown source (first occurrence, 1-based)
- Commented text renders highlighted with a tiny type label at end/top of last word
- Hovering highlighted text shows the date/time and note
- Highlights update reactively; removed entries' highlights disappear
- Multiple/overlapping comments are supported additively
- Tests in `hub/client/src/screens/Projections.test.tsx`

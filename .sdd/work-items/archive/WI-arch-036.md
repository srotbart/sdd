---
id: WI-arch-036
gap-id: GAP-arch-039
domain: architecture
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add projection comments GET/PUT/DELETE endpoints to the Hub server

**Scope:** `hub/server/index.ts` — add three route handlers for `/workspaces/:id/projections/:name/comments`: GET (returns array or []), PUT (persists entry array to co-located `.sdd/projections/<name>.comments.json`), DELETE `/workspaces/:id/projections/:name/comments/:commentId` (removes entry by id); sanitize `:name` to prevent path traversal; write tests in a new `hub/server/projections-comments.test.ts`.

**Acceptance criteria:**
- `GET /workspaces/:id/projections/:name/comments` returns `[]` when `.comments.json` absent, or the parsed array when present
- `PUT /workspaces/:id/projections/:name/comments` writes the request body array to `<name>.comments.json`, creating the file if absent
- `DELETE /workspaces/:id/projections/:name/comments/:commentId` removes the entry with matching `id` and rewrites the file; returns 404 if entry not found
- Each entry shape includes `id`, `action` (clarify|re-evaluate|expand|condense), `selectedText`, `line`, `note`, `createdAt`
- `:name` is sanitized so a traversal attempt (e.g. `../secret`) is rejected with 400
- File is co-located in `.sdd/projections/` (same directory as `<name>.md`)
- Unknown workspace id returns 404 on all three routes
- Test: GET returns [] when comments file absent
- Test: PUT writes entries; subsequent GET returns them
- Test: DELETE removes the correct entry by id; GET confirms removal
- Test: DELETE returns 404 for unknown commentId
- Test: path traversal in `:name` returns 400

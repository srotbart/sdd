---
id: WI-arch-008
gap-id: [GAP-arch-010, GAP-arch-011]
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add GET /workspaces and PATCH /workspaces/:id API endpoints + wire Settings screen

**Scope:** `server/index.ts` + `server/db/index.ts` + `client/src/screens/Settings.tsx` — add a minimal JSON API router, implement both endpoints, add `updateWorkspace` db helper, fetch workspace data on load, and call PATCH on field blur

**Acceptance criteria:**
- `GET /workspaces` returns `Content-Type: application/json` with an array of all workspace rows
- `PATCH /workspaces/:id` with `{ description: "new" }` updates only the description field and returns the updated row
- `PATCH /workspaces/:id` with unknown id returns 404
- `PATCH /workspaces/:id` with no valid fields in body returns 400
- Settings screen fetches workspace data from `GET /workspaces` on mount and populates the form
- Editing a field and tabbing away (blur) sends `PATCH /workspaces/:id` with the changed field
- Test: PATCH with a valid id and `{ name: "renamed" }` returns 200 with updated name; subsequent GET returns the new name

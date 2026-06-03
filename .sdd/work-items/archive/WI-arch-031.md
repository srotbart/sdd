---
id: WI-arch-031
gap-id: GAP-arch-034
domain: architecture
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Implement GET /recent-workspaces endpoint on the server

**Scope:** `hub/server/index.ts` — add a `GET /recent-workspaces` route handler in `handleApi()` that queries SQLite for the 5 most recently created workspaces and returns `{ id, name, path, hasSdd }[]`, where `hasSdd` is computed by checking whether `{path}/.sdd/` exists on disk.

**Acceptance criteria:**
- `GET /recent-workspaces` returns HTTP 200 with `Content-Type: application/json`
- Response is a JSON array of up to 5 entries ordered by `created_at` descending
- Each entry includes `id`, `name`, `path`, and `hasSdd` (boolean, true when `{path}/.sdd/` exists)
- Returns an empty array when no workspaces exist
- Server test: endpoint returns correct workspace data with `hasSdd` computed from disk
- Server test: `AttachWorkspaceDialog` in the client receives and renders the recent workspaces list (or existing client test passes with a mock)

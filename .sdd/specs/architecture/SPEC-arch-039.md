---
id: SPEC-arch-039
domain: architecture
abbrev: arch
status: active
aliases: []
version: "ea71593b"
---

# SPEC-arch-039 — GET /recent-workspaces returns the most recently attached workspaces

The server handles `GET /recent-workspaces`. It returns a JSON array of the 5 most recently created workspaces (by `created_at` descending), each with fields `{ id: string, name: string, path: string, hasSdd: boolean }`. `hasSdd` is `true` when `{path}/.sdd/` exists on disk at request time. Returns an empty array when no workspaces exist. No authentication required (SPEC-arch-007).

**Tests:**
hub/server/spec-arch-http.test.ts > SPEC-arch-039: GET /recent-workspaces > SPEC-arch-039: returns most recent workspaces newest-first with id/name/path/hasSdd — "GET /recent-workspaces returns recent workspaces newest-first with hasSdd"
hub/server/spec-arch-http.test.ts > SPEC-arch-039: GET /recent-workspaces > SPEC-arch-039: returns empty array when no workspaces exist — "GET /recent-workspaces returns an empty array when none exist"
hub/server/spec-arch.test.ts > SPEC-arch-039: recent-workspaces store query > SPEC-arch-039: getRecentWorkspaces returns up to 5 rows newest-first — "the store returns up to 5 recent workspaces newest-first"

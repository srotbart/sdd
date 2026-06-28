---
id: SPEC-arch-042
domain: architecture
abbrev: arch
status: active
aliases: []
version: "ed33021c"
---

# SPEC-arch-042 — Hub server reads, writes, and deletes co-located projection comments JSON

## Invariant

The Hub server exposes endpoints to read, write, and delete projection comments persisted in a
JSON file co-located with the projection markdown at `.sdd/projections/<name>.comments.json`
(same directory as `<name>.md`). A GET returns the array of comment entries (an empty array when
the file is absent); a write endpoint persists entries, creating the file if needed; a delete
mechanism removes a single entry by `id`. Each entry carries `id`, `action`
(`clarify` | `re-evaluate` | `expand` | `condense`), `selectedText`, `line`, `note`, and
`createdAt`. The `<name>` path segment is validated/sanitized so requests cannot escape the
workspace's `.sdd/projections/` directory.

## Acceptance criteria

- `GET /workspaces/:id/projections/:name/comments` returns the JSON array of entries, or `[]`
  when the file does not exist
- A write endpoint (`PUT` or `POST` on the same path) persists comment entries to
  `.sdd/projections/<name>.comments.json`, creating the file if absent
- A delete mechanism removes a single entry by `id` (and supports clearing addressed entries),
  rewriting the JSON file
- Each persisted entry includes: `id`, `action` (clarify|re-evaluate|expand|condense),
  `selectedText`, `line`, `note`, `createdAt`
- The `:name` segment is sanitized so requests cannot traverse outside the workspace
  `.sdd/projections/` directory
- The comments JSON is co-located with the projection markdown (same directory), named
  `<name>.comments.json`

**Tests:**

- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > GET returns [] when comments file is absent` — GET returns empty array when the comments JSON file is missing
- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > GET returns [] when .sdd/projections/ does not exist at all` — GET returns empty array when the projections directory is absent
- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > PUT writes entries; subsequent GET returns them` — PUT persists entries to file and GET reads them back
- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > PUT creates .sdd/projections/ directory if absent` — PUT creates the directory if it does not exist
- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > DELETE removes the correct entry by id; GET confirms removal` — DELETE removes the entry by id and GET confirms
- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > DELETE returns 404 for unknown commentId` — DELETE returns 404 when the id is not found
- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > path traversal in :name returns 400` — path-traversal in the name segment is rejected with 400
- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > unknown workspace id returns 404 on GET` — unknown workspace returns 404 on GET
- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > unknown workspace id returns 404 on PUT` — unknown workspace returns 404 on PUT
- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > unknown workspace id returns 404 on DELETE` — unknown workspace returns 404 on DELETE
- `hub/server/projections-comments.test.ts > Projection comments endpoints — SPEC-arch-042 > PUT returns 400 for invalid JSON body` — malformed JSON body is rejected with 400
- `hub/server/designs.test.ts > GET /workspaces/:id/designs/:name — SPEC-scr-042 > rejects a path-traversal design name with 400 (SPEC-arch-042)` — path-traversal in the design name is rejected with 400
- `hub/server/projections.test.ts > GET /workspaces/:id/projections/:name — SPEC-scr-040 > rejects a path-traversal projection name with 400 (SPEC-arch-042)` — path-traversal in the projection name is rejected with 400

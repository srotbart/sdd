---
id: SPEC-arch-042
domain: architecture
abbrev: arch
status: active
aliases: []
version: "b4fb72b1"
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

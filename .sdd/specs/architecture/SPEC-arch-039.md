---
id: SPEC-arch-039
domain: architecture
abbrev: arch
status: active
aliases: []
version: "a91b676c"
---

# SPEC-arch-039 — GET /recent-workspaces returns the most recently attached workspaces

The server handles `GET /recent-workspaces`. It returns a JSON array of the 5 most recently created workspaces (by `created_at` descending), each with fields `{ id: string, name: string, path: string, hasSdd: boolean }`. `hasSdd` is `true` when `{path}/.sdd/` exists on disk at request time. Returns an empty array when no workspaces exist. No authentication required (SPEC-arch-007).

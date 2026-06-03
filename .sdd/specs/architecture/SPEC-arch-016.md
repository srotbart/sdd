---
id: SPEC-arch-016
domain: architecture
abbrev: arch
status: active
aliases: []
version: "fb0d5716"
---

# SPEC-arch-016 — GET /workspaces/:id/work-items returns parsed work item files as JSON

`GET /workspaces/:id/work-items` reads all work item files from `.sdd/work-items/` and `.sdd/work-items/archive/` within the workspace path and returns a JSON array. Each item includes: `id`, `gapId` (from `gap-id`), `domain`, `status`, `created`, `abandonedReason` (from `abandoned-reason`), `title` (from `# Work Item:` heading), `scope` (from `**Scope:**` body field), `acceptance` (array from `**Acceptance criteria:**` bullets), `progressNote` (from `**Progress:**` body field), `blockedReason` (from `**Blocked:**` body field), `closed` (from frontmatter `closed` field). The fetch is triggered whenever the active workspace ID changes.

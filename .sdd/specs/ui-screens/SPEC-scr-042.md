---
id: SPEC-scr-042
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "fbb3a8ab"
---

# SPEC-scr-042 — Hub backend serves design docs from .sdd/design/

## Invariant

The Hub backend exposes two design endpoints: `GET /workspaces/:id/designs` returns a list of design metadata (name, last modified) by scanning `.sdd/design/` for subdirectories that contain a `design.md` file; `GET /workspaces/:id/designs/:name` returns the raw markdown content of `.sdd/design/<name>/design.md`. The existing chokidar watcher covers `.sdd/design/` and broadcasts `sdd-changed` when any file within a design directory changes.

## Acceptance criteria

- `GET /workspaces/:id/designs` returns an array of `{ name, lastModified }` for each subdirectory of `.sdd/design/` containing a `design.md`
- `GET /workspaces/:id/designs/:name` returns the raw markdown of `.sdd/design/<name>/design.md`; responds 404 when the file does not exist
- Chokidar watcher covers `.sdd/design/` and fires `onChange` on any change within it
- A design file change causes the existing WebSocket `sdd-changed` broadcast to fire with updated designs data
- Both endpoints return empty/null gracefully when `.sdd/design/` does not exist

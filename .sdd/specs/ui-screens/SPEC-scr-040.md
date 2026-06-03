---
id: SPEC-scr-040
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "beba7c43"
---

# SPEC-scr-040 — Hub backend serves projections and watches for live changes

## Invariant

The Hub backend exposes two projection endpoints: `GET /workspaces/:id/projections` returns a list of projection metadata (name, last modified) derived from `.sdd/projections/*.md` files; `GET /workspaces/:id/projections/:name` returns the raw markdown content of `.sdd/projections/<name>.md`. The existing chokidar watcher is extended to watch `.sdd/projections/` in addition to `.sdd/`; any change to a projection file triggers the existing `sdd-changed` WebSocket broadcast so connected Hub clients receive live updates.

## Acceptance criteria

- `GET /workspaces/:id/projections` returns an array of `{ name, lastModified }` objects for each `.md` file in `.sdd/projections/`
- `GET /workspaces/:id/projections/:name` returns the raw markdown string for the named projection; responds 404 if not found
- Chokidar watcher covers `.sdd/projections/` and fires `onChange` on any file add, change, or delete within it
- A projection file change causes the existing WebSocket `sdd-changed` broadcast to fire, containing updated projections data
- Both endpoints return empty/null gracefully when `.sdd/projections/` does not exist

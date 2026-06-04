---
id: SPEC-scr-040
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "183c6194"
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

**Tests:**
- `hub/server/projections.test.ts > GET /workspaces/:id/projections — SPEC-scr-040 > returns name and lastModified for each .md file in .sdd/projections/` — "list endpoint returns one {name,lastModified} per projection markdown file"
- `hub/server/projections.test.ts > GET /workspaces/:id/projections — SPEC-scr-040 > returns empty array when .sdd/projections/ does not exist` — "list endpoint returns empty array gracefully when the directory is missing"
- `hub/server/projections.test.ts > GET /workspaces/:id/projections/:name — SPEC-scr-040 > returns raw markdown content of the named projection` — "content endpoint serves the raw markdown of the named projection"
- `hub/server/projections.test.ts > GET /workspaces/:id/projections/:name — SPEC-scr-040 > returns 404 when the named projection file does not exist` — "content endpoint responds 404 for an unknown projection"
- `hub/server/spec-scr.test.ts > startWatcher — projections directory (SPEC-scr-040) > SPEC-scr-040: fires onChange when a file under .sdd/projections/ is added` — "watcher covering .sdd fires onChange when a projection file is added"
- `hub/server/spec-scr.test.ts > startWatcher — projections directory (SPEC-scr-040) > SPEC-scr-040: fires onChange when a projection file changes` — "watcher fires onChange (the sdd-changed trigger) when a projection file is edited"

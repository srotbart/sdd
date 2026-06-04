---
id: SPEC-scr-042
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "9b7ffe59"
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

**Tests:**
- `hub/server/designs.test.ts > GET /workspaces/:id/designs — SPEC-scr-042 > returns name and lastModified for each subdirectory containing design.md` — "list endpoint returns one {name,lastModified} per design directory holding a design.md"
- `hub/server/designs.test.ts > GET /workspaces/:id/designs — SPEC-scr-042 > skips subdirectories that do not contain design.md` — "directories without a design.md are excluded from the list"
- `hub/server/designs.test.ts > GET /workspaces/:id/designs — SPEC-scr-042 > returns empty array when .sdd/design/ does not exist` — "list endpoint returns empty array gracefully when the directory is missing"
- `hub/server/designs.test.ts > GET /workspaces/:id/designs/:name — SPEC-scr-042 > returns raw markdown content of design.md for the named design` — "content endpoint serves the raw design.md markdown for the named design"
- `hub/server/designs.test.ts > GET /workspaces/:id/designs/:name — SPEC-scr-042 > returns 404 when the named design does not exist` — "content endpoint responds 404 for an unknown design"
- `hub/server/spec-scr.test.ts > startWatcher — design directory (SPEC-scr-042) > SPEC-scr-042: fires onChange when a file under .sdd/design/ is added` — "watcher covering .sdd fires onChange when a design file is added"
- `hub/server/spec-scr.test.ts > startWatcher — design directory (SPEC-scr-042) > SPEC-scr-042: fires onChange when a design.md changes` — "watcher fires onChange (the sdd-changed trigger) when a design.md is edited"

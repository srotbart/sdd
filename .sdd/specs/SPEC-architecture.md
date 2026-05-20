---
id: SPEC-arch
domain: architecture
abbrev: arch
version: "ddb6ef82"
aliases: []
---

# Spec: Architecture

## SPEC-arch-001 — Server runtime is Node.js
*Status: active | Aliases: none*

The hub server runs on Node.js. No other server runtime is permitted.

## SPEC-arch-002 — Frontend is React + TypeScript, bundled with Vite
*Status: active | Aliases: none*

The UI is a React application written in TypeScript and bundled with Vite. The server serves the built assets as static files.

## SPEC-arch-003 — Persistence is SQLite via better-sqlite3
*Status: active | Aliases: none*

All persistent state (workspace registry, agent connections, settings) is stored in a local SQLite database accessed via the better-sqlite3 driver. No other database engine is used.

## SPEC-arch-004 — Filesystem watching uses chokidar, debounced 150–300 ms
*Status: active | Aliases: none*

The server watches each workspace's `.sdd/` directory tree using chokidar. Change events are debounced 150–300 ms before triggering a re-parse, so rapid batched file writes (e.g. a git checkout) do not flood the system.

## SPEC-arch-005 — Server exposes a WebSocket endpoint for UI clients
*Status: active | Aliases: none*

The hub server maintains a WebSocket endpoint that UI browser clients connect to for real-time state push. On connection, the server sends a full state snapshot; subsequent messages are typed update events (artifact changed, agent status changed, etc.).

## SPEC-arch-006 — Server accepts WebSocket connections from Claude Code agents
*Status: active | Aliases: none*

Claude Code agent processes connect to the hub server over WebSocket to register, send heartbeats, and emit structured activity events (file edits, test runs, work-item state transitions). The server tracks connected agents per workspace with status (idle/busy), last-heartbeat, pid, and host.

## SPEC-arch-007 — Hub runs entirely on localhost; no authentication required
*Status: active | Aliases: none*

The server binds exclusively to 127.0.0.1. No remote access, no authentication, and no TLS are required for v1.

## SPEC-arch-008 — Server listens on port 22351
*Status: active | Aliases: none*

The hub server listens on TCP port 22351. This port is fixed and not configurable.

## SPEC-arch-009 — Only one server instance may run at a time
*Status: active | Aliases: none*

If a second hub server process is started while one is already listening on port 22351, the new process must detect the conflict, print a clear error message, and exit immediately with a non-zero exit code. No mechanism may allow two instances to run simultaneously.

## SPEC-arch-010 — GET /workspaces returns all workspaces from SQLite
*Status: active | Aliases: none*

The server handles `GET /workspaces` and returns a JSON array of all workspace rows (`id`, `name`, `path`, `description`, `created_at`). Response content-type is `application/json`.

## SPEC-arch-013 — GET /workspaces/:id/specs returns parsed spec files as JSON
*Status: active | Aliases: none*

The server handles `GET /workspaces/:id/specs`. It resolves the workspace path from SQLite, reads all `SPEC-*.md` files from `{path}/.sdd/specs/`, parses frontmatter (`id`, `domain`, `abbrev`, `version`) and each `## SPEC-{abbrev}-{seq}` item (title, active/deprecated status, body text, ref IDs from trailing ref pills), and returns a JSON array of spec objects. Returns 404 if the workspace is unknown, empty array if no spec files exist.

## SPEC-arch-012 — GET /browse-folder opens a native macOS folder picker and returns the selected path
*Status: active | Aliases: none*

The server exposes `GET /browse-folder` which invokes `osascript` to open the system folder-chooser dialog. It returns `{ path: string }` with the POSIX path of the selected folder, or `{ path: null }` if the user cancels. The endpoint is macOS-only for v1.

## SPEC-arch-011 — PATCH /workspaces/:id persists workspace field changes to SQLite
*Status: active | Aliases: none*

The server handles `PATCH /workspaces/:id` with a partial JSON body containing any subset of `{ name, path, description }`. It updates only the provided fields in the matching SQLite row and returns the updated workspace as JSON. Unknown or missing `:id` returns 404. Invalid body returns 400.

## SPEC-arch-017 — Vite dev server listens on port 22400
*Status: active | Aliases: none*

The Vite dev server for `hub/client` is configured to listen on port `22400` instead of the default `5173`. This is set via `server.port: 22400` in `hub/client/vite.config.ts`.

## SPEC-arch-018 — Server broadcasts sdd-changed events to UI clients when artifacts change
*Status: active | Aliases: none*

When chokidar detects a file change under a workspace's `.sdd/targets/`, `.sdd/specs/`, `.sdd/gaps/`, or `.sdd/work-items/` directories (including `archive/` subdirectories), the server broadcasts a WebSocket message to all connected UI clients with shape `{ type: "sdd-changed", workspaceId: string, artifact: "targets" | "specs" | "gaps" | "work-items" }`. Changes are debounced at the existing 150–300ms interval. The UI client listens for these messages and re-fetches the affected endpoint (`GET /workspaces/:id/{artifact}`) for the active workspace, replacing the corresponding live state without a full page reload.

## SPEC-arch-015 — GET /workspaces/:id/gaps returns parsed gap files as JSON
*Status: active | Aliases: none*

`GET /workspaces/:id/gaps` reads all gap files from `.sdd/gaps/` and `.sdd/gaps/archive/` within the workspace path and returns a JSON array. Each item includes: `id`, `specItem`, `domain`, `status`, `discovered`, `auditVersion` (from `audit-spec-version`), `closedBy` (from `closed-by`), `deferredReason` (from `deferred-reason`), `title` (from `# Gap:` heading), `location` (from `**Location:**` / `**Locations:**` body field), `reasoning` (from `**Reasoning:**` body field). The fetch is triggered whenever the active workspace ID changes.

## SPEC-arch-016 — GET /workspaces/:id/work-items returns parsed work item files as JSON
*Status: active | Aliases: none*

`GET /workspaces/:id/work-items` reads all work item files from `.sdd/work-items/` and `.sdd/work-items/archive/` within the workspace path and returns a JSON array. Each item includes: `id`, `gapId` (from `gap-id`), `domain`, `status`, `created`, `abandonedReason` (from `abandoned-reason`), `title` (from `# Work Item:` heading), `scope` (from `**Scope:**` body field), `acceptance` (array from `**Acceptance criteria:**` bullets), `progressNote` (from `**Progress:**` body field), `blockedReason` (from `**Blocked:**` body field), `closed` (from frontmatter `closed` field). The fetch is triggered whenever the active workspace ID changes.

## SPEC-arch-014 — GET /workspaces/:id/targets returns parsed target files as JSON
*Status: active | Aliases: none*

The server handles `GET /workspaces/:id/targets`. It resolves the workspace path from SQLite, reads all `*.md` files from `{path}/.sdd/targets/` and from `{path}/.sdd/targets/archive/`, parses frontmatter (`id`, `status`, `created`, `domain`) and the Current statement body text, and returns a JSON array of all target objects (both active and archived). The frontend uses the `status` field to categorise targets. Returns 404 if the workspace is unknown, empty array if no target files exist. Response content-type is `application/json`.

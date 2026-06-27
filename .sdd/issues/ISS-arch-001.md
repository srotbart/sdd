---
id: ISS-arch-001
domain: architecture
status: open
location: "hub/server/ws-pty.ts:63"
severity: high
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: Terminal PTY spawn with unvalidated cwd can crash the whole hub

**Location:** `hub/server/ws-pty.ts:63`
**Problem:** `spawn(shell, [], { cwd })` runs inside the WebSocket connection handler with a client-supplied `cwd` and no try/catch, and node-pty throws synchronously when `cwd` does not exist.
**Rationale:** `index.ts` installs no `process.on('uncaughtException')` handler, so opening a terminal for a deleted/moved workspace (or any client passing `?cwd=/nonexistent`) throws an unhandled exception that takes down the server for all connected clients.
**Severity:** high

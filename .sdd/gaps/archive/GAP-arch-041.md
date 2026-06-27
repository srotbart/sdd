---
id: GAP-arch-041
spec-item: SPEC-arch-043
domain: architecture
status: closed
discovered: "2026-06-27T22:46:57Z"
audit-spec-version: "542c72a3"
closed-by: WI-arch-038
deferred-reason: null
---

# Gap: Terminal PTY spawn can crash the hub process on an invalid cwd

**Location:** `hub/server/ws-pty.ts:63`
**Reasoning:** The node-pty `spawn` runs with a client-supplied `cwd` and no try/catch, and the process installs no `uncaughtException` handler, so an invalid `cwd` throws synchronously and takes down the whole server — violating SPEC-arch-043's intent that the hub serve a terminal over the WebSocket.

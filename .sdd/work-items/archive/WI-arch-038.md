---
id: WI-arch-038
gap-id: GAP-arch-041
domain: architecture
status: done
created: "2026-06-27T23:00:00Z"
abandoned-reason: null
---

# Work Item: Guard node-pty spawn against invalid cwd

**Scope:** `hub/server/ws-pty.ts:63` — validate that `cwd` exists with `fs.existsSync` before calling `spawn`, and wrap the `spawn` call in a try/catch; on failure send an error message over the WebSocket and close the socket cleanly rather than throwing

**Acceptance criteria:**
- If the client-supplied `cwd` does not exist on the filesystem, fall back to `process.cwd()` (safe default) before spawning — or close the socket with an error; either way the hub process must not crash
- `spawn` is wrapped in try/catch; any synchronous throw closes the WebSocket with an error frame instead of propagating as an uncaught exception
- Happy-path terminal behaviour (valid cwd, normal spawn) is unchanged
- Test: connecting with a non-existent `cwd` query param does not throw — the socket closes gracefully (error or closed event received) without crashing the server
- Test: connecting with a valid cwd (or no cwd) still spawns the PTY and the server remains alive

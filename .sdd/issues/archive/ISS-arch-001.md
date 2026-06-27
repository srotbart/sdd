---
id: ISS-arch-001
domain: architecture
status: accepted
location: "hub/server/ws-pty.ts:63"
severity: high
discovered: "2026-06-27T21:55:29Z"
reviewed-by: GAP-arch-041
engaged-by: GAP-arch-041
---

# Issue: Terminal PTY spawn with unvalidated cwd can crash the whole hub

**Location:** `hub/server/ws-pty.ts:63`
**Problem:** `spawn(shell, [], { cwd })` runs inside the WebSocket connection handler with a client-supplied `cwd` and no try/catch, and node-pty throws synchronously when `cwd` does not exist.
**Rationale:** `index.ts` installs no `process.on('uncaughtException')` handler, so opening a terminal for a deleted/moved workspace (or any client passing `?cwd=/nonexistent`) throws an unhandled exception that takes down the server for all connected clients.
**Severity:** high

## Dialog

### 2026-06-27 — Agent
Recommendation: **accept as a gap** against SPEC-arch-043 (Hub server provides a node-pty
terminal over a localhost WebSocket). This is a robustness divergence — the terminal spawn
must not be able to crash the process — not a redefinition of intended behaviour, so a spec
change is not required. The user pre-authorised fixing this issue as part of the prioritised
Tier-1 batch (PR 1: hub robustness + security), which serves as the accept sign-off.
Outcome: GAP-arch-041 written; issue archived as accepted.

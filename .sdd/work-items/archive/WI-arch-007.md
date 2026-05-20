---
id: WI-arch-007
gap-id: [GAP-arch-008, GAP-arch-009]
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Fix port to 22351 and enforce single-instance startup

**Scope:** `server/index.ts` — hardcode port to 22351; handle EADDRINUSE by printing a clear error and calling process.exit(1)

**Acceptance criteria:**
- Server always binds to port 22351 (no env var override, no fallback)
- Starting a second instance while one is running prints a human-readable error (e.g. "SDD Hub is already running on port 22351") and exits with code 1
- No unhandled 'error' event crash — EADDRINUSE is caught and handled explicitly
- Test: spawning two server processes sequentially, the second exits with code 1 and its stderr contains "already running"

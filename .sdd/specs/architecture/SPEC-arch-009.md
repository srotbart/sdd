---
id: SPEC-arch-009
domain: architecture
abbrev: arch
status: active
aliases: []
version: "36bc0d04"
---

# SPEC-arch-009 — Only one server instance may run at a time

If a second hub server process is started while one is already listening on port 22351, the new process must detect the conflict, print a clear error message, and exit immediately with a non-zero exit code. No mechanism may allow two instances to run simultaneously.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-009: single-instance enforcement > SPEC-arch-009: index.ts handles EADDRINUSE by printing an error and exiting non-zero — "a port conflict makes the server print an error and exit with a non-zero code"

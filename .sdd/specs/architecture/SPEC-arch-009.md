---
id: SPEC-arch-009
domain: architecture
abbrev: arch
status: active
aliases: []
version: "dd156e38"
---

# SPEC-arch-009 — Only one server instance may run at a time

If a second hub server process is started while one is already listening on port 22351, the new process must detect the conflict, print a clear error message, and exit immediately with a non-zero exit code. No mechanism may allow two instances to run simultaneously.

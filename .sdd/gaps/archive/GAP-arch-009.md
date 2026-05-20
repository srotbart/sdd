---
id: GAP-arch-009
spec-item: SPEC-arch-009
domain: architecture
status: closed
discovered: "2026-05-15T00:00:00Z"
audit-spec-version: "689ddaf6"
closed-by: WI-arch-007
deferred-reason: null
---

# Gap: No single-instance enforcement — two processes can bind simultaneously

**Location:** server/index.ts — no port-conflict detection or early-exit on EADDRINUSE

**Reasoning:** Server does not detect an already-running instance; a second start attempt would fail silently or with an unformatted Node.js error rather than a clear message and deliberate exit.

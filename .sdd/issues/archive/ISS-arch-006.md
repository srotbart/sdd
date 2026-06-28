---
id: ISS-arch-006
domain: architecture
status: accepted
location: "hub/server/index.ts:496"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: fix/server-dedup
---

# Issue: Watcher onChange/onSpecsChanged closure duplicated three times

**Location:** `hub/server/index.ts:496`
**Problem:** The identical `(changedPath) => { broadcastUpdate; resolveArtifact; broadcastSddChanged }` plus `() => broadcastSddChanged(id, 'specs')` closure pair is written three times (POST create, PATCH swapWatcher, startWatchers).
**Rationale:** Three verbatim copies of the watcher-callback wiring must all be updated together whenever broadcast behaviour changes.
**Severity:** medium

## Dialog

### 2026-06-28 — Agent
Accepted as a **standards-violation refactor** (no gap, per SPEC-wf-028/029). Standards rule:
"one source per repeated mechanism — watcher-callback wiring" (Architectural Rules).
Refactored in `fix/server-dedup`: the three duplicated watcher closures replaced by a
`watcherCallbacks` factory. Behavior preserved (server suite 337). Archived as accepted.

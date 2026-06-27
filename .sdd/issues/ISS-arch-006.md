---
id: ISS-arch-006
domain: architecture
status: open
location: "hub/server/index.ts:496"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: Watcher onChange/onSpecsChanged closure duplicated three times

**Location:** `hub/server/index.ts:496`
**Problem:** The identical `(changedPath) => { broadcastUpdate; resolveArtifact; broadcastSddChanged }` plus `() => broadcastSddChanged(id, 'specs')` closure pair is written three times (POST create, PATCH swapWatcher, startWatchers).
**Rationale:** Three verbatim copies of the watcher-callback wiring must all be updated together whenever broadcast behaviour changes.
**Severity:** medium

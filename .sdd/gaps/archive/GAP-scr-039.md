---
id: GAP-scr-039
spec-item: SPEC-scr-040
domain: ui-screens
status: closed
discovered: "2026-06-01T00:00:00Z"
audit-spec-version: "beba7c43"
closed-by: WI-scr-040
deferred-reason: null
---

# Gap: Watcher does not cover .sdd/projections/ and artifact resolver missing projections entry

**Locations:**
- `hub/server/watcher.ts:51` — chokidar watches `.sdd` root only; no explicit `.sdd/projections/` coverage verified to fire onChange
- `hub/server/sdd-artifact.ts:4` — `SDD_ARTIFACT_DIRS` array does not include a `projections` entry, so projection file changes return `null` from `resolveArtifact` and never trigger `broadcastSddChanged`

**Reasoning:** A projection file change passes through `onChange` in `index.ts:273` which calls `resolveArtifact`, but since projections is absent from `SDD_ARTIFACT_DIRS`, the artifact resolves to `null` and `broadcastSddChanged` is never called — the `sdd-changed` WebSocket broadcast required by SPEC-scr-040 never fires for projection changes.

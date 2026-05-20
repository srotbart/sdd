---
id: WI-arch-017
gap-id: GAP-arch-020
domain: architecture
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Emit sdd-changed WebSocket message from server watcher

**Scope:** `hub/server/ws-ui.ts` and `hub/server/index.ts` — add a `broadcastSddChanged` function that emits `{ type: "sdd-changed", workspaceId: string, artifact: "targets" | "specs" | "gaps" | "work-items" }`, then update the per-workspace watcher callback in `index.ts` to derive `workspaceId` and `artifact` from the changed file path and call it instead of (or in addition to) `broadcastUpdate`.

**Acceptance criteria:**
- `broadcastSddChanged(workspaceId, artifact)` is exported from `ws-ui.ts` and sends the correct typed message shape to all connected UI clients
- The watcher callback in `index.ts` maps the changed path to the correct `artifact` value (`targets`, `specs`, `gaps`, or `work-items`) including `archive/` subdirectories, and passes the corresponding `workspaceId`
- Changes outside the four tracked subdirectories do not emit a `sdd-changed` event
- Unit test: `broadcastSddChanged` sends `{ type: "sdd-changed", workspaceId, artifact }` to all open WS clients
- Unit test: path mapping correctly derives `artifact` for each of the four directories and their `archive/` subdirs

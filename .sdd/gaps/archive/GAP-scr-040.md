---
id: GAP-scr-040
spec-item: SPEC-scr-042
domain: ui-screens
status: closed
discovered: "2026-06-01T00:00:00Z"
audit-spec-version: "fbb3a8ab"
closed-by: WI-scr-041
deferred-reason: null
---

# Gap: No /designs backend endpoints and no watcher coverage for .sdd/design/

**Locations:**
- `hub/server/index.ts:182` — no `designsListMatch` or `designsItemMatch` handler exists; the file ends at the projections handlers with no designs routes
- `hub/server/sdd-artifact.ts:4` — `SDD_ARTIFACT_DIRS` has no `designs` entry so `.sdd/design/` changes never produce an artifact broadcast
- `hub/server/watcher.ts:51` — watcher only covers the `.sdd` root glob, and no explicit `.sdd/design/` coverage is configured

**Reasoning:** SPEC-scr-042 requires `GET /workspaces/:id/designs` and `GET /workspaces/:id/designs/:name` endpoints scanning `.sdd/design/` subdirectories, plus chokidar coverage of `.sdd/design/` — none of these exist in the server.

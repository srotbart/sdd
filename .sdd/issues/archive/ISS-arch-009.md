---
id: ISS-arch-009
domain: architecture
status: accepted
location: "hub/server/sdd-artifact.ts:4"
severity: high
discovered: "2026-06-27T22:18:12Z"
reviewed-by: GAP-arch-044
engaged-by: GAP-arch-044
---

# Issue: Issues, improvements, and standards never refresh live over WebSocket

**Location:** `hub/server/sdd-artifact.ts:4` (and the client handler at `hub/client/src/App.tsx:304`)
**Problem:** `resolveArtifact`'s `SDD_ARTIFACT_DIRS` maps only targets/specs/gaps/work-items/projections/designs, so a change under `.sdd/issues/`, `.sdd/improvements/`, or `.sdd/standards/` resolves to `null` and **no `sdd-changed` broadcast is emitted**; correspondingly the client `onmessage` handler has no `issues`/`improvements`/`standards` branch, so even a broadcast would be ignored.
**Rationale:** Creating, editing, or archiving an issue/improvement/standard does not update the UI until the workspace is re-selected or the page reloaded — e.g. the 12 issues just written do not appear live. This is a two-layer gap (server omits the dirs, client omits the branches) distinct from the debounce-coalescing bug in ISS-arch-003. Note the per-artifact fetch effects in App.tsx also key only on `activeWorkspaceId`, so there is no fallback refresh path.
**Severity:** high

## Dialog

### 2026-06-27 — Agent
Recommendation: **accept as a gap** against SPEC-arch-018 (Server broadcasts sdd-changed
events to UI clients when artifacts change). The server omits issues/improvements/standards
from the broadcast map and the client omits the matching handler branches — a coordinated
code divergence, not a behaviour change, so a gap is correct. User pre-authorised fixing this
in the prioritised batch (PR 3). Outcome: GAP-arch-044 written (locations span
sdd-artifact.ts, ws-ui.ts, App.tsx, Standards.tsx); issue archived as accepted.

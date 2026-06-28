---
id: ISS-ui-001
domain: ui-layout
status: accepted
location: "hub/client/src/App.tsx:376"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: fix/client-dedup
---

# Issue: Nine repeated per-artifact fetch effects in App

**Location:** `hub/client/src/App.tsx:376`
**Problem:** Nine near-identical `useEffect` blocks (specs/targets/gaps/work-items/issues/improvements/projections/designs/standards) each repeat the same fetch-then-set-or-clear pattern, and the same fetch+map logic is duplicated again inside the WebSocket `onmessage` handler.
**Rationale:** The same data-loading shape copied ~12 times bloats the component and invites divergent error handling across artifact types.
**Severity:** medium

## Dialog

### 2026-06-28 — Agent
Accepted as a **standards-violation refactor** (no gap, per SPEC-wf-028/029). Standards rule:
"one source per repeated mechanism — per-artifact client fetch effects" (Architectural Rules).
Refactored in `fix/client-dedup`: the ~9 duplicated fetch `useEffect` blocks (and the
onmessage re-fetches) now go through a `fetchInto` helper. Behavior preserved (client 556,
server 337). Archived as accepted.

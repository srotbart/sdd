---
id: ISS-ui-001
domain: ui-layout
status: open
location: "hub/client/src/App.tsx:376"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: Nine repeated per-artifact fetch effects in App

**Location:** `hub/client/src/App.tsx:376`
**Problem:** Nine near-identical `useEffect` blocks (specs/targets/gaps/work-items/issues/improvements/projections/designs/standards) each repeat the same fetch-then-set-or-clear pattern, and the same fetch+map logic is duplicated again inside the WebSocket `onmessage` handler.
**Rationale:** The same data-loading shape copied ~12 times bloats the component and invites divergent error handling across artifact types.
**Severity:** medium

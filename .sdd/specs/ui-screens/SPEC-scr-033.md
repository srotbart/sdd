---
id: SPEC-scr-033
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "78507c7c"
---

# SPEC-scr-033 — App.tsx fetches liveSpecs from GET /workspaces/:id/specs; all mock constants removed

`App.tsx` maintains a `liveSpecs: Spec[]` state variable fetched from `GET /workspaces/:id/specs` when a workspace becomes active and re-fetched when a `sdd-changed` WebSocket event with `artifact: "specs"` arrives. `liveSpecs` is passed to Session, Gaps, WorkItems, Specs, and CommandPalette. The constants `MOCK_SPECS`, `MOCK_GAPS`, and `MOCK_WORK_ITEMS` are deleted from `App.tsx` — none may remain as dead code.

**Tests:**
- `hub/client/src/App.test.tsx > No mock constants in App (SPEC-scr-033) > App renders with live specs fetched from server — Session receives liveSpecs not mock data` — "App fetches liveSpecs from GET /workspaces/:id/specs — no mock constants"
- `hub/client/src/App.test.tsx > sdd-changed WebSocket message triggers re-fetch (WI-arch-018) > re-fetches /specs when sdd-changed artifact is 'specs'` — "App re-fetches liveSpecs when a sdd-changed event arrives for specs"

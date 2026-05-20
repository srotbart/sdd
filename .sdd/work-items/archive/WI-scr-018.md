---
id: WI-scr-018
gap-id: GAP-scr-019
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

**Scope:** `hub/client/src/App.tsx` — on mount, read `?w=`, `?v=`, and `&id=` query params from `window.location.search` and use them to initialise `activeWorkspaceId`, `activeTab`, and `selectedItemId`; URL params take precedence over `localStorage`; fall back to `localStorage` then first workspace if `?w=` is absent or unrecognised; default `?v=` to `targets` if unrecognised; ignore `&id=` if unrecognised for the active tab.

**Acceptance criteria:**
- On mount with `?w=<id>&v=targets`, the targets tab is active for that workspace
- On mount with `?w=<id>&v=unrecognised`, the targets tab is active (default fallback)
- On mount with no params, falls back to `localStorage` then first workspace (existing behavior preserved)
- On mount with `?w=<missing-id>`, falls back to `localStorage` then first workspace
- Unit test: `App` initialises workspace and tab from URL params, ignoring `localStorage`
- Unit test: unrecognised `?v=` defaults to `targets`
- Unit test: unrecognised `?w=` falls back to `localStorage` value when present

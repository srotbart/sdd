---
id: SPEC-scr-009
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "23d82d8a"
---

# SPEC-scr-009 — Targets screen fetches live data from the backend

When a workspace is active, `client/src/App.tsx` fetches `GET /workspaces/:id/targets` and passes the result to the `Targets` component, replacing any static mock. The fetch is triggered whenever the active workspace ID changes. The API response fields (`id`, `status`, `created`, `domain`, `statement`) are mapped to the frontend `Target` type before being passed to the component.

**Tests:**
- `hub/client/src/App.test.tsx > App targets data wiring > fetches /workspaces/:id/targets after workspace is auto-selected` — "App fetches targets from the backend when a workspace becomes active"
- `hub/client/src/App.test.tsx > API target mapping (WI-scr-001) > renders Targets without crashing when API returns only required fields` — "API response fields are mapped to the Target type before rendering"

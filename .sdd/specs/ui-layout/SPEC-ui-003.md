---
id: SPEC-ui-003
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "a07f9a43"
---

# SPEC-ui-003 — Header spans full viewport width above sidenav and main content

The header is position-fixed at the very top of the viewport, spanning the full width (above both the sidenav and the main content area). Minimum height 44 px. Left side: app logo/name (`sdd-hub`) and a breadcrumb showing current scope (`hub / workspace / screen`). Right side: connected agent count, hub address (`localhost:22351`), and current date/time. No tab bar in the header — navigation is in the sidenav NAVIGATE section.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-003 — header spans full width with logo, breadcrumb, agent count, address, clock > SPEC-ui-003: header renders logo, breadcrumb scope, agent count, hub address and a date/time, with no tab bar` — "Header shows logo, breadcrumb scope, agent count, hub address and a clock, and carries no tab bar."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-003 — header spans full width with logo, breadcrumb, agent count, address, clock > SPEC-ui-003: agent count is singular when there is exactly one agent` — "Agent count label is singular for a single connected agent."

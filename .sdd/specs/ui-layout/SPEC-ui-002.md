---
id: SPEC-ui-002
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "17331860"
---

# SPEC-ui-002 — Sidenav is fixed, 252 px wide, below the header, with three sections

The sidenav is position-fixed on the left edge below the header, 252 px wide, separated from the main area by a 1 px hairline border (`var(--hair)`). It contains three sections top-to-bottom: (1) a "hub overview" row with a live/idle dot; (2) a **WORKSPACE** section (uppercase eyebrow + "+" button) listing attached workspaces — one row per workspace with a dot indicator, name, and an alert badge for items awaiting user attention, active row has a 2 px accent left border; (3) a **NAVIGATE** section (uppercase eyebrow) with one row per screen (session, targets, specs, gaps, work items, activity, settings) and a count badge on the right — active item is accent-colored with a 2 px accent left border.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-002 — sidenav structure and sections > SPEC-ui-002: sidenav contains hub-overview row, WORKSPACE eyebrow, and NAVIGATE section when a workspace is active` — "Sidenav exposes the hub-overview row, WORKSPACE section, and per-screen NAVIGATE rows."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-002 — sidenav structure and sections > SPEC-ui-002: active nav row carries the --active modifier class (accent marker)` — "The active screen row is marked with the active accent modifier."

---
id: SPEC-ui
domain: ui-layout
abbrev: ui
version: "dba43916"
aliases: []
---

# Spec: UI Layout

## SPEC-ui-001 — Application shell is a three-region layout
*Status: active | Aliases: none*

The application shell divides the viewport into exactly three regions: a left sidenav, a top header, and a main content area. All screens render inside the main content area; the sidenav and header are persistent chrome.

## SPEC-ui-002 — Sidenav is fixed, 252 px wide, below the header, with three sections
*Status: active | Aliases: none*

The sidenav is position-fixed on the left edge below the header, 252 px wide, separated from the main area by a 1 px hairline border (`var(--hair)`). It contains three sections top-to-bottom: (1) a "hub overview" row with a live/idle dot; (2) a **WORKSPACE** section (uppercase eyebrow + "+" button) listing attached workspaces — one row per workspace with a dot indicator, name, and an alert badge for items awaiting user attention, active row has a 2 px accent left border; (3) a **NAVIGATE** section (uppercase eyebrow) with one row per screen (session, targets, specs, gaps, work items, activity, settings) and a count badge on the right — active item is accent-colored with a 2 px accent left border.

## SPEC-ui-003 — Header spans full viewport width above sidenav and main content
*Status: active | Aliases: none*

The header is position-fixed at the very top of the viewport, spanning the full width (above both the sidenav and the main content area). Minimum height 44 px. Left side: app logo/name (`sdd-hub`) and a breadcrumb showing current scope (`hub / workspace / screen`). Right side: connected agent count, hub address (`localhost:22351`), and current date/time. No tab bar in the header — navigation is in the sidenav NAVIGATE section.

## SPEC-ui-004 — Only the main content area scrolls
*Status: active | Aliases: none*

The sidenav and header are always fully visible regardless of scroll position. Only the main content area scrolls vertically. Horizontal scrolling is not permitted at the shell level.

## SPEC-ui-007 — Workspace selector is a dropdown in the sidenav
*Status: active | Aliases: none*

The active workspace row in the sidenav WORKSPACE section is a dropdown trigger showing the live/idle dot, workspace name, alert badge, and a `▴` chevron. Clicking it opens a dropdown panel listing all workspaces (dot, name, path in mono, alert badge; active row has 2 px accent left border) with a "+ attach workspace" row at the bottom. Clicking outside closes it. Clicking a workspace selects it and closes the panel.

## SPEC-ui-008 — Attach Workspace modal dialog
*Status: active | Aliases: none*

Clicking the `+` button or the "+ attach workspace" dropdown row opens a modal dialog: Newsreader italic title *Attach workspace*, hairline separator, PROJECT LOCATION section with a full-width path input and a `browse…` ghost link, RECENT FOLDERS section (paper-2 card) listing recently seen paths with description and a `● FRESH` / `● SDD READY` status chip. Footer has an Esc-to-cancel hint, `cancel` ghost button, and a solid `attach workspace` primary button. Escape and backdrop click close the dialog. On submit calls `POST /workspaces` with `{ name, path }`.

## SPEC-ui-009 — Plugin reference entry is pinned to the bottom of the sidenav
*Status: active | Aliases: none*

The plugin reference navigation entry sits at the very bottom of the sidenav, pinned to the bottom edge. It does not scroll with the workspace list or NAVIGATE section above it. A hairline separator visually divides it from the NAVIGATE section. It is always visible regardless of how many workspaces or nav items are above it.

## SPEC-ui-006 — Main content sits to the right of the sidenav and below the header
*Status: active | Aliases: none*

The main content area is offset: top by the header height, left by the sidenav width (252 px). It fills the remaining viewport space and scrolls vertically only. The sidenav and header are always visible.

## SPEC-ui-005 — Visual treatment follows the editorial direction from the design handoff
*Status: active | Aliases: none*

The shell uses the editorial visual system defined in `SDD Hub.html`: white page background (`#ffffff`), charcoal ink text (`#18181a`), no drop shadows anywhere, and hairline borders (1 px `#ececea`) as the only structural dividers. Color appears only on artifact IDs/active-state markers (oxblood accent `#7e3a2c`) and status pills.

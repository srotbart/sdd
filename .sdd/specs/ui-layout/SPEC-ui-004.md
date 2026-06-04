---
id: SPEC-ui-004
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "59fd6af7"
---

# SPEC-ui-004 — Only the main content area scrolls

The sidenav and header are always fully visible regardless of scroll position. Only the main content area scrolls vertically. Horizontal scrolling is not permitted at the shell level.

**Tests:** skipped — pure CSS overflow behaviour — not observable in jsdom

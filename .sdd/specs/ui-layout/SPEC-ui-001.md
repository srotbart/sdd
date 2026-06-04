---
id: SPEC-ui-001
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "9a115cb3"
---

# SPEC-ui-001 — Application shell is a three-region layout

The application shell divides the viewport into exactly three regions: a left sidenav, a top header, and a main content area. All screens render inside the main content area; the sidenav and header are persistent chrome.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-001 — application shell three-region layout > SPEC-ui-001: shell renders header, sidenav, and main regions` — "Mounting the App renders all three shell regions (header, sidenav, main)."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-001 — application shell three-region layout > SPEC-ui-001: header and sidenav are persistent chrome and main is the screen container` — "Header, sidenav and main are sibling regions under the app shell."

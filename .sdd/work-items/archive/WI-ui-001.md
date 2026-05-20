---
id: WI-ui-001
gap-id: [GAP-ui-001, GAP-ui-004]
domain: ui-layout
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create three-region App shell with scroll isolation

**Scope:** `client/src/App.tsx` + `client/src/App.css` — implement the fixed sidenav + fixed header + scrollable main layout using CSS (position: fixed for sidenav and header; overflow-y: auto on main only)

**Acceptance criteria:**
- Shell renders three regions: sidenav on the left, header at the top, main filling the remainder
- Sidenav and header remain fixed during main content scroll
- Main content area scrolls vertically; no horizontal scroll at shell level
- Test: snapshot/render test confirms sidenav and header are present in the DOM regardless of main content height

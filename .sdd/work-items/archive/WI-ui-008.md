---
id: WI-ui-008
gap-id: GAP-ui-008
domain: ui-layout
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Pin plugin reference section to absolute bottom of sidenav

**Scope:** `hub/client/src/components/Sidenav.css` and `hub/client/src/components/Sidenav.tsx` — restructure sidenav so the plugin-ref section is removed from the scrolling flow and pinned to the absolute bottom edge via `position: absolute; bottom: 0` on the section and `padding-bottom` on the scrollable inner content to prevent overlap

**Acceptance criteria:**
- `.sidenav` switches from `overflow-y: auto` on the whole element to a flex-column layout with an inner scrollable div for the hub-row/workspace/navigate sections and an absolutely-positioned plugin-ref section pinned to `bottom: 0`
- A hairline `border-top: 1px solid var(--hair)` visually separates the plugin-ref section from the scrollable content above
- The plugin-ref row is always visible at the bottom of the sidenav regardless of how many workspaces or nav items are present
- When the scrollable content is short enough to fit, the plugin-ref section still appears at the very bottom (not floating mid-sidenav)
- Unit/component test: plugin-ref element is rendered and positioned outside the scrollable content container

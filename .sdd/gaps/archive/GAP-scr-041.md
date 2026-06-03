---
id: GAP-scr-041
spec-item: SPEC-scr-043
domain: ui-screens
status: closed
discovered: "2026-06-01T00:00:00Z"
audit-spec-version: "71dbf37b"
closed-by: WI-scr-042
deferred-reason: null
---

# Gap: Designs screen does not exist — no Designs.tsx, no sidenav entry, no App.tsx wiring

**Locations:**
- `hub/client/src/screens/` — no `Designs.tsx` or `Designs.css` file exists
- `hub/client/src/App.tsx:14` — no import for a Designs component; no `designs` tab case in the render switch
- `hub/client/src/App.tsx:26` — tab map has no `designs` entry between projections and gaps

**Reasoning:** SPEC-scr-043 requires a Designs screen in the sidebar between Projections and Gaps with a two-pane layout, auto-refresh on `sdd-changed`, and empty state — none of this exists.

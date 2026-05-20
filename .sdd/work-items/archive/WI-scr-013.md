---
id: WI-scr-013
gap-id: GAP-scr-013
domain: ui-screens
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Fix archived divider to use eyebrow-divider visual treatment

**Scope:** `hub/client/src/screens/Targets.tsx:321` and `hub/client/src/screens/Targets.css:495` — update the archived divider JSX to render `· ARCHIVED N ·` (dot on each side) flanked by full-width `<hr>` elements on both sides, and restyle `.targets-archived-divider` to match the eyebrow-divider treatment (muted colour, small-caps/uppercase tracking, no lone border-bottom).

**Acceptance criteria:**
- Divider label renders as `· ARCHIVED N ·` with a dot on each side
- A full-width horizontal rule appears above and below the label
- Label uses muted colour, uppercase tracking (eyebrow-divider treatment)
- `N` reflects the live count of archived targets for the active workspace
- Visual snapshot test or manual verification: divider matches eyebrow-divider style in all filter states
- No regression: archived rows still appear below the divider when filter is `all`

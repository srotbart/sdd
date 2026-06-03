---
id: SPEC-scr-010
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "b05765dc"
---

# SPEC-scr-010 — Targets screen archived section divider

In the Targets screen left list, the divider between active and archived rows renders as `· ARCHIVED N ·` — a centred label with a dot on each side — flanked by full-width horizontal rule lines on both sides. The divider is not a plain text string; it uses the eyebrow-divider visual treatment (muted colour, small caps or uppercase tracking, ruled lines). The `N` is the live count of archived targets for the active workspace.

**Tests:**
- `hub/client/src/screens/Targets.test.tsx > Targets archived tab and section > when all is selected, active targets appear before the ARCHIVED divider` — "Archived section divider separates active from archived targets"
- `hub/client/src/screens/Targets.test.tsx > Targets archived tab and section > archived tab appears in the filter bar with accepted target count` — "Archived tab shows the count of accepted/archived targets"

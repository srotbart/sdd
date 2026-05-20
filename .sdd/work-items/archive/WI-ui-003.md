---
id: WI-ui-003
gap-id: GAP-ui-003
domain: ui-layout
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create Header component

**Scope:** `client/src/components/Header.tsx` — implement fixed top toolbar with 60 px min-height and 22–32 px horizontal padding showing active workspace name and tab bar

**Acceptance criteria:**
- Header renders with min-height of 60 px
- Horizontal padding is between 22 px and 32 px
- Active workspace name and tab bar are rendered as props-driven content
- Test: render with a workspace name and tabs list displays both correctly

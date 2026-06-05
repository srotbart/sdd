---
id: WI-scr-050
gap-id: GAP-scr-048
domain: ui-screens
status: done
created: "2026-06-05T09:15:00Z"
abandoned-reason: null
---

# Work Item: Add Issues and Improvements Hub screens

**Scope:** `hub/client/src/screens/Issues.tsx`, `hub/client/src/screens/Improvements.tsx` — create both screens with list+detail pattern; wire server parser + API endpoints; add nav entries; add vitest tests.

**Acceptance criteria:**
- Issues screen lists ISS-* artifacts with severity, status, domain; selecting a row shows detail
- Improvements screen lists IMP-* artifacts with effort/impact, status, domain; selecting a row shows detail
- Both screens have nav entries in Sidenav NAV_TABS alongside other artifact screens
- Hub server loads `.sdd/issues/` and `.sdd/improvements/` via parse functions exposed through `/workspaces/:id/issues` and `/workspaces/:id/improvements` endpoints
- Both screens render gracefully with an empty-state message when no artifacts exist
- Screens are read-only (no create/edit/engage actions)
- Unit test: Issues screen renders empty state when issues=[]  (SPEC-scr-050)
- Unit test: Issues screen renders ISS-* rows with severity/status/domain (SPEC-scr-050)
- Unit test: Improvements screen renders empty state when improvements=[] (SPEC-scr-050)
- Unit test: Improvements screen renders IMP-* rows with effort/impact/status/domain (SPEC-scr-050)

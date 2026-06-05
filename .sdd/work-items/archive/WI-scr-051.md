---
id: WI-scr-051
gap-id: GAP-scr-049
domain: ui-screens
status: done
created: "2026-06-05T09:15:00Z"
abandoned-reason: null
---

# Work Item: Add Standards Hub screen

**Scope:** `hub/client/src/screens/Standards.tsx` — create screen that fetches and renders `.sdd/standards/` content as readable sections; wire server endpoint; add nav entry; add vitest tests.

**Acceptance criteria:**
- Standards screen renders standards content as readable sections, not an artifact ID list
- Content source is `/workspaces/:id/standards` API endpoint which reads `.sdd/standards/` files
- Screen has a nav entry in Sidenav NAV_TABS alongside other screens
- Screen renders gracefully with an empty-state message when no standards files exist
- Screen is read-only
- Unit test: Standards screen renders empty state when no content (SPEC-scr-051)
- Unit test: Standards screen renders standards content as section headings (SPEC-scr-051)

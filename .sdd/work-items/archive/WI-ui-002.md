---
id: WI-ui-002
gap-id: GAP-ui-002
domain: ui-layout
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create Sidenav component

**Scope:** `client/src/components/Sidenav.tsx` — implement fixed left sidebar at 252 px width with a 1 px right hairline border listing attached workspaces

**Acceptance criteria:**
- Sidenav renders at exactly 252 px wide
- Right border is 1 px solid `var(--hair)` with no box-shadow
- Workspace list renders one row per workspace passed as props
- Test: render with two workspaces produces two list items with correct names

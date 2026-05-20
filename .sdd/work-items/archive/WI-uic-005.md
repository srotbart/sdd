---
id: WI-uic-005
gap-id: GAP-uic-002
domain: ui-components
status: done
created: "2026-05-17T12:00:00Z"
abandoned-reason: null
---

# Work Item: Wire ArchiveFooter into WorkItems screen

**Scope:** `hub/client/src/screens/WorkItems.tsx` — update done-column filter to 24h window and render `<ArchiveFooter>` below the kanban grid

**Acceptance criteria:**
- "done · today" column shows only items with `closed` timestamp within the last 24 hours
- Items with `status === 'done'` closed more than 24 hours ago are excluded from the kanban column
- Items with `status === 'abandoned'` are excluded from the kanban entirely
- `<ArchiveFooter>` is rendered below the kanban grid, receiving all done (older than 24h) and abandoned items as `items` prop
- `onOpenItem` callback opens the WorkItemDrawer for the selected item
- `activeId` reflects the currently open drawer item
- Test: done item closed 25h ago does not appear in kanban done column but appears in ArchiveFooter items
- Test: abandoned item does not appear in kanban and appears in ArchiveFooter items
- Test: done item closed 1h ago appears in kanban done column and not in ArchiveFooter

---
id: GAP-uic-002
spec-item: SPEC-uic-002
status: closed
discovered: "2026-05-17T12:00:00Z"
audit-spec-version: "76943212"
closed-by: WI-uic-005
deferred-reason: null
---

# GAP-uic-002 — ArchiveFooter component does not exist

**Locations:**
- `hub/client/src/components/ArchiveFooter.tsx` — file does not exist
- `hub/client/src/components/ArchiveFooter.css` — file does not exist
- `hub/client/src/screens/WorkItems.tsx:38` — done column filters all `status === 'done'` with no 24-hour window; older done + abandoned not routed to ArchiveFooter
- `hub/client/src/screens/WorkItems.tsx:74` — no `<ArchiveFooter>` rendered below the kanban grid

**Reasoning:** `ArchiveFooter.tsx` and `ArchiveFooter.css` are entirely absent; `WorkItems.tsx` shows all done items in the kanban column without the 24h cutoff and never renders `<ArchiveFooter>`.

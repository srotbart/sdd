---
id: WI-uic-016
gap-id: GAP-uic-013
domain: ui-components
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Remove STATUS_BORDER from WorkItems.tsx and use StatusPill-derived colors

**Scope:** `hub/client/src/screens/WorkItems.tsx:24` — delete the `STATUS_BORDER` constant and all its usages; replace border-color assignments that depend on it with a value derived from the kanban column identity (e.g. a fixed CSS variable per column status) so no ArtifactStatus-to-color mapping is defined outside StatusPill.

**Acceptance criteria:**
- `STATUS_BORDER` constant is removed from `WorkItems.tsx`
- No independent `Record<string, string>` or object that maps `ArtifactStatus` values to colors exists in `WorkItems.tsx`
- Kanban cards still have a visible left border differentiating columns (using CSS variables or inline style from column config, not a status-color map)
- Unit test: kanban renders without referencing STATUS_BORDER — the constant is not exported or importable
- Unit test: pending/in-progress/blocked column cards render with a left border style set

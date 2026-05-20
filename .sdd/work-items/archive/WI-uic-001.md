---
id: WI-uic-001
gap-id: GAP-uic-001
domain: ui-components
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create ArtifactList shared component

**Scope:** `hub/client/src/components/ArtifactList.tsx` + `hub/client/src/components/ArtifactList.css` — create the generic typed component and its stylesheet

**Acceptance criteria:**
- `ArtifactList.tsx` exports a generic component accepting `items`, `archivedItems`, `renderRow(item, archived): ReactNode`, and `getKey(item): string` props
- Divider renders `· ARCHIVED N ·` flanked by `<hr>` rules, with `letter-spacing: 0.18em`, `font-weight: 500`, uppercase, and a ▾/▸ caret toggle that controls visibility of archived rows
- `ArtifactList.css` contains the divider styles and archived-row opacity (`opacity: 0.55` at rest, `0.85` on hover)
- Archived rows are wrapped in a container applying opacity from the CSS class (not inline style)
- Component renders active items above the divider, archived items below (hidden when collapsed)
- TypeScript: no type errors (`tsc --noEmit` passes)

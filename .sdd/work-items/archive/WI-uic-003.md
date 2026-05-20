---
id: WI-uic-003
gap-id: GAP-uic-001
domain: ui-components
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Refactor Gaps.tsx to use ArtifactList

**Scope:** `hub/client/src/screens/Gaps.tsx` — split the flat `filtered` list into active and archived sections and render them via `<ArtifactList>`

**Acceptance criteria:**
- `Gaps.tsx` imports and renders `<ArtifactList>` with active gaps as `items` and closed/archived gaps as `archivedItems`
- The divider and archived-row opacity are provided by `ArtifactList` (no inline opacity or divider markup in `Gaps.tsx`)
- Active and archived gap rows are visually identical to their existing appearance; the archived section adds the collapsible divider header
- TypeScript: no type errors (`tsc --noEmit` passes)
- A render test confirms both active and archived gap rows appear in the DOM and the archived section is collapsible

---
id: WI-uic-018
gap-id: GAP-uic-015
domain: ui-components
status: done
created: "2026-06-05T11:06:00Z"
abandoned-reason: null
---

# Work Item: Implement ArtifactPeeker component with shared context

**Scope:** `hub/client/src/components/ArtifactPeeker.tsx` + `hub/client/src/components/ArtifactPeeker.css` + `hub/client/src/components/PeekerContext.tsx` — create a right-side slide-over component and shared React context so any component can open it

**Acceptance criteria:**
- `ArtifactPeeker` component renders a right-side panel that slides over the content
- It accepts an artifact id + type and resolves content from app data
- It supports all artifact types (`TGT-`, `SPEC-`, `GAP-`, `WI-`, `ISS-`, `IMP-`) reusing existing per-type detail views
- Dismissible via close button, `Esc` keydown, and click-outside
- Provides a "go to artifact" button that calls `onNav` to navigate to the artifact's dedicated screen
- `PeekerContext` (or equivalent) is exported so any component can open the peeker
- The peeker is wired as a single app-level instance in `App.tsx`
- Unit test (SPEC-uic-011): renders with a target artifact id — shows TargetDetail content
- Unit test (SPEC-uic-011): pressing Esc closes the peeker
- Unit test (SPEC-uic-011): clicking the overlay backdrop closes the peeker
- Unit test (SPEC-uic-011): clicking the close button closes the peeker
- Unit test (SPEC-uic-011): "go to artifact" button triggers onNav with the correct tab + id
- Unit test (SPEC-uic-011): peeker renders for all artifact types without crashing

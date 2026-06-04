---
id: SPEC-uic-001
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "7f969d26"
---

# SPEC-uic-001 — ArtifactList is a shared component for lists with a collapsible archived section

`hub/client/src/components/ArtifactList.tsx` is a generic component that renders a list of active items followed by a collapsible archived section. Props: `items` (active), `archivedItems`, `renderRow(item, archived): ReactNode`, `getKey(item): string`. The divider renders `· ARCHIVED N ·` flanked by `<hr>` rules, `letter-spacing: 0.18em`, `font-weight: 500`, uppercase, with a ▾/▸ caret toggle. Archived rows are wrapped in a container applying `opacity: 0.55` at rest, `0.85` on hover. Divider and opacity styles live in `ArtifactList.css`. `Targets.tsx` and `Gaps.tsx` use `ArtifactList` instead of inline implementations; both screens must be visually identical to their pre-refactor state. No other screens are in scope.

**Tests:**
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-001 ArtifactList collapsible archived section > SPEC-uic-001: renders active items followed by a collapsible archived section` — active items, ARCHIVED-count divider with two flanking rules, and archived rows all render.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-001 ArtifactList collapsible archived section > SPEC-uic-001: clicking the divider collapses and re-expands the archived rows with caret toggle` — divider click toggles archived row visibility and flips the ▾/▸ caret.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-001 ArtifactList collapsible archived section > SPEC-uic-001: renders no divider when there are no archived items` — no archived divider when archivedItems is empty.

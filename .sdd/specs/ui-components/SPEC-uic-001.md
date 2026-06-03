---
id: SPEC-uic-001
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "a1e3fd58"
---

# SPEC-uic-001 — ArtifactList is a shared component for lists with a collapsible archived section

`hub/client/src/components/ArtifactList.tsx` is a generic component that renders a list of active items followed by a collapsible archived section. Props: `items` (active), `archivedItems`, `renderRow(item, archived): ReactNode`, `getKey(item): string`. The divider renders `· ARCHIVED N ·` flanked by `<hr>` rules, `letter-spacing: 0.18em`, `font-weight: 500`, uppercase, with a ▾/▸ caret toggle. Archived rows are wrapped in a container applying `opacity: 0.55` at rest, `0.85` on hover. Divider and opacity styles live in `ArtifactList.css`. `Targets.tsx` and `Gaps.tsx` use `ArtifactList` instead of inline implementations; both screens must be visually identical to their pre-refactor state. No other screens are in scope.

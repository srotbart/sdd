---
id: SPEC-uic
domain: ui-components
abbrev: uic
version: "76943212"
aliases: []
---

# Spec: UI Components

Shared, reusable React components that are consumed by two or more screens. Components in this domain live under `hub/client/src/components/`.

## SPEC-uic-002 — ArchiveFooter is a shared component for the WorkItems archive strip
*Status: active | Aliases: none*

`hub/client/src/components/ArchiveFooter.tsx` is a collapsible bottom strip component for the WorkItems screen. Props: `items` (archived work items), `onOpenItem(id)`, `activeId`. Toggle bar uses the eyebrow treatment from `ArtifactList.css` (`letter-spacing: 0.18em`, `font-weight: 500`, `text-transform: uppercase`). Collapsed (40px): `▸ archive`, count in mono, "last closed N ago" in italic serif. Expanded (max-height 320px, animated): bar shows `▾` caret, search input (`⌕` + placeholder "search archive…"), status filter buttons (all / done / abandoned with counts), domain filter buttons. Body scrolls horizontally, grouped by closed date (Today / Yesterday / weekday + date). Each day-column holds `arch-card` elements (240px): ID, status pill, serif title, agent chip or "unassigned", gap ID. `done` cards: `var(--st-done)` left border; `abandoned`: `var(--ink-4)` left border, `opacity: 0.85`. Active card is highlighted. Filters reset on collapse. `WorkItems.tsx` renders `<ArchiveFooter>` below the kanban grid. The "done · today" kanban column shows only items closed within the last 24 hours; older done + all abandoned items are excluded from the kanban and shown only in `ArchiveFooter`.

## SPEC-uic-001 — ArtifactList is a shared component for lists with a collapsible archived section
*Status: active | Aliases: none*

`hub/client/src/components/ArtifactList.tsx` is a generic component that renders a list of active items followed by a collapsible archived section. Props: `items` (active), `archivedItems`, `renderRow(item, archived): ReactNode`, `getKey(item): string`. The divider renders `· ARCHIVED N ·` flanked by `<hr>` rules, `letter-spacing: 0.18em`, `font-weight: 500`, uppercase, with a ▾/▸ caret toggle. Archived rows are wrapped in a container applying `opacity: 0.55` at rest, `0.85` on hover. Divider and opacity styles live in `ArtifactList.css`. `Targets.tsx` and `Gaps.tsx` use `ArtifactList` instead of inline implementations; both screens must be visually identical to their pre-refactor state. No other screens are in scope.

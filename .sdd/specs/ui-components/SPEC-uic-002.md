---
id: SPEC-uic-002
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "23226927"
---

# SPEC-uic-002 — ArchiveFooter is a shared component for the WorkItems archive strip

`hub/client/src/components/ArchiveFooter.tsx` is a collapsible bottom strip component for the WorkItems screen. Props: `items` (archived work items), `onOpenItem(id)`, `activeId`. Toggle bar uses the eyebrow treatment from `ArtifactList.css` (`letter-spacing: 0.18em`, `font-weight: 500`, `text-transform: uppercase`). Collapsed (40px): `▸ archive`, count in mono, "last closed N ago" in italic serif. Expanded (max-height 320px, animated): bar shows `▾` caret, search input (`⌕` + placeholder "search archive…"), status filter buttons (all / done / abandoned with counts), domain filter buttons. Body scrolls horizontally, grouped by closed date (Today / Yesterday / weekday + date). Each day-column holds `arch-card` elements (240px): ID, status pill, serif title, agent chip or "unassigned", gap ID. `done` cards: `var(--st-done)` left border; `abandoned`: `var(--ink-4)` left border, `opacity: 0.85`. Active card is highlighted. Filters reset on collapse. `WorkItems.tsx` renders `<ArchiveFooter>` below the kanban grid. The "done · today" kanban column shows only items closed within the last 24 hours; older done + all abandoned items are excluded from the kanban and shown only in `ArchiveFooter`.

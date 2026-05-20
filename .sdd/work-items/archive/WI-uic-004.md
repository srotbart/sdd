---
id: WI-uic-004
gap-id: GAP-uic-002
domain: ui-components
status: done
created: "2026-05-17T12:00:00Z"
abandoned-reason: null
---

# Work Item: Create ArchiveFooter component

**Scope:** `hub/client/src/components/ArchiveFooter.tsx` and `hub/client/src/components/ArchiveFooter.css` — create the collapsible archive strip component from scratch

**Acceptance criteria:**
- `ArchiveFooter.tsx` exists and exports `ArchiveFooter` with props: `items` (archived work items), `onOpenItem(id)`, `activeId`
- Toggle bar uses eyebrow styling matching `ArtifactList.css`: `letter-spacing: 0.18em`, `font-weight: 500`, `text-transform: uppercase`
- Collapsed state (40px height): shows `▸ archive`, item count in mono, "last closed N ago" in italic serif
- Expanded state: max-height 320px with CSS animation; bar shows `▾` caret, search input (`⌕` + placeholder "search archive…"), status filter buttons (all / done / abandoned with counts), domain filter buttons
- Body scrolls horizontally; items grouped by closed date (Today / Yesterday / weekday + date)
- Each `arch-card` is 240px wide: ID, status pill, serif title, agent chip or "unassigned", gap ID
- `done` cards have `var(--st-done)` left border; `abandoned` cards have `var(--ink-4)` left border and `opacity: 0.85`
- Active card (matching `activeId`) is highlighted
- Filters reset to "all" when the strip collapses
- Test: component renders collapsed by default showing count and last-closed time
- Test: expanding shows search input and filter buttons; collapsing resets filters
- Test: done/abandoned cards display correct border color and opacity

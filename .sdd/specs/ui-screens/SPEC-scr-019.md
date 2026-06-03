---
id: SPEC-scr-019
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "f5f60588"
---

# SPEC-scr-019 — Command palette for fuzzy search across workspace artifacts

A `CommandPalette` component is triggered by `⌘K` / `Ctrl+K` and renders as a full-screen overlay that closes on outside click. The dialog has three regions: (1) input row with `⌕` glyph, text field with placeholder "Search targets, specs, gaps, work items…", and a scope chip showing the active workspace name; (2) scrollable results grouped by kind (targets, gaps, work items, spec items, spec files) with group headers; (3) footer with keyboard hints (↑↓ / ↵ / Esc) and result count. Default state (no query) shows "Recent" targets (4), gaps (3), work items (3). Search scores ID (1.6×), title (1.2×), full text (0.7×); top 30 results; matched characters highlighted with `<mark class="cp-mark">`. Keyboard: ArrowUp/Down moves selection; Enter navigates and closes; Escape closes. Each result row shows a kind glyph (▸ target, ≠ gap, □ work, ∎ spec), ID in mono accent, title, status pill, and domain/location/linked-ID metadata.

**Tests:**
- `hub/client/src/components/CommandPalette.test.tsx > CommandPalette (WI-scr-010) > input has the correct placeholder text` — "Palette input has the 'Search targets, specs, gaps, work items…' placeholder"
- `hub/client/src/components/CommandPalette.test.tsx > CommandPalette (WI-scr-010) > typing a query filters results to matching items` — "Typing a query narrows results to matching artifacts"
- `hub/client/src/components/CommandPalette.test.tsx > CommandPalette (WI-scr-010) > matched characters are highlighted with cp-mark` — "Matching characters are highlighted with cp-mark"
- `hub/client/src/components/CommandPalette.test.tsx > CommandPalette (WI-scr-010) > pressing Escape calls onClose` — "Escape key closes the palette"

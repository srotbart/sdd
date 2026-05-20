---
id: WI-scr-010
gap-id: GAP-scr-010
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Create CommandPalette component with fuzzy search and keyboard navigation

**Scope:** `hub/client/src/components/CommandPalette.tsx` (new file) and `hub/client/src/App.tsx` — create `CommandPalette` component triggered by `⌘K`/`Ctrl+K`; renders full-screen overlay closing on outside click; three regions: (1) input row with `⌕` glyph, text field placeholder "Search targets, specs, gaps, work items…", scope chip; (2) scrollable results grouped by kind with group headers; (3) footer with keyboard hints and result count. Default state shows recent targets (4), gaps (3), work items (3). Search scores ID (1.6×), title (1.2×), full text (0.7×), top 30 results, matched chars highlighted with `<mark class="cp-mark">`. Keyboard: ArrowUp/Down moves selection, Enter navigates+closes, Escape closes. Each result row: kind glyph (▸/≠/□/∎), ID mono accent, title, status pill, domain/location/linked-ID metadata.

**Acceptance criteria:**
- `CommandPalette` component exists and renders without errors
- `⌘K`/`Ctrl+K` opens the overlay; Escape closes it; click outside closes it
- Input field has `⌕` prefix glyph and correct placeholder text
- Results are grouped by kind with group headers
- Keyboard ArrowUp/Down moves selection highlight; Enter navigates to selected result and closes palette
- Default (no query) shows recent targets, gaps, work items
- Matched characters highlighted with `<mark class="cp-mark">`
- Test: press `⌘K`, assert overlay is visible; press Escape, assert overlay is hidden
- Test: type an ID prefix and assert matching result appears in the correct group
- Test: ArrowDown moves selection from first to second result

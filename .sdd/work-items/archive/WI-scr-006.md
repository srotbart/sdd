---
id: WI-scr-006
gap-id: GAP-scr-006
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Targets archived divider: make collapsible with correct eyebrow styling and mono count

**Scope:** `hub/client/src/screens/Targets.tsx` and `hub/client/src/screens/Targets.css` — add toggle state for archived section; archived divider prepends `▾`/`▸` caret; update label CSS to `letter-spacing: 0.18em`, `font-weight: 500`, `text-transform: uppercase`, `font-size: 10px`, `color: var(--ink-3)`; render archived count in a separate `<span>` with `font-family: var(--mono)`, `letter-spacing: 0`, `color: var(--ink-4)`.

**Acceptance criteria:**
- Clicking the archived divider toggles archived rows visible/hidden
- Divider label prepends `▾` when open and `▸` when closed
- CSS: `letter-spacing: 0.18em`, `font-weight: 500`, `font-size: 10px`, `color: var(--ink-3)` on label element
- Archived count is in a separate `<span>` with `font-family: var(--mono)` and `letter-spacing: 0`
- Test: click divider and assert archived rows are hidden; click again and assert they are visible
- Test: divider label starts with `▾` when open

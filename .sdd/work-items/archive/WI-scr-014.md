---
id: WI-scr-014
gap-id: GAP-scr-014
domain: ui-screens
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Set active target rows to white (#ffffff) background

**Scope:** `hub/client/src/screens/Targets.css:116` — add `background: #ffffff` (or `var(--paper)`) to `.target-row` so active (non-archived) rows render white instead of inheriting the off-white `var(--paper-2)` from `.targets-list`.

**Acceptance criteria:**
- `.target-row` has an explicit `background: var(--paper)` (which resolves to `#ffffff`)
- Active (non-archived) target rows render with a white background in the browser
- Hover and active-selection states remain visually distinct (still use `var(--paper-3)`)
- Unit/snapshot test confirms `.target-row` background token is `var(--paper)` or `#ffffff`
- No regression: archived rows below the divider may retain a muted/dimmed background

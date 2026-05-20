---
id: WI-scr-020
gap-id: GAP-scr-020
domain: ui-screens
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Override archived row opacity to 1 when row is selected/active

**Scope:** `hub/client/src/components/ArtifactList.css` — add a CSS rule that resets `.artifact-list-archived-row` opacity to `1` and sets `background: var(--paper-2)` when the wrapper contains an active/selected descendant row

**Acceptance criteria:**
- `.artifact-list-archived-row:has(.target-row--active)` (or equivalent selector) sets `opacity: 1` and `background: var(--paper-2)`
- An archived row that is selected renders at full opacity with `var(--paper-2)` background and the accent left border inherited from `.target-row--active`
- Non-selected archived rows retain `opacity: 0.55`
- CSS test: `ArtifactList.css` contains an opacity-1 override rule scoped to an active descendant inside `.artifact-list-archived-row`

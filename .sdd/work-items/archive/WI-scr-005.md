---
id: WI-scr-005
gap-id: ["GAP-scr-005", "GAP-scr-011"]
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Targets list background and archived row opacity

Reason for many-to-one: both GAP-scr-005 and GAP-scr-011 are fixed by the same CSS pass — correcting `.targets-list` background to `var(--paper)` and adding opacity rules to archived rows.

**Scope:** `hub/client/src/screens/Targets.css` and `hub/client/src/screens/Targets.tsx` — change `.targets-list` from `background: var(--paper-2)` to `background: var(--paper)`; add an `.target-row--archived` CSS class with `opacity: 0.55`, hover `opacity: 0.85`, and selected state `opacity: 1` + `background: var(--paper-2)`; apply `.target-row--archived` to archived rows in the JSX.

**Acceptance criteria:**
- `.targets-list` has `background: var(--paper)` in CSS
- Archived `TargetListRow` instances receive a CSS class or style that sets `opacity: 0.55`
- Hover over archived row raises opacity to `0.85`
- Selected archived row has `opacity: 1` and `background: var(--paper-2)` with accent left border
- Test: render archived target row and assert `opacity` is `0.55` (computed style or class presence)
- Test: active (non-archived) target rows do not have opacity modifier

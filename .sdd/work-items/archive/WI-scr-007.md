---
id: WI-scr-007
gap-id: GAP-scr-007
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Targets dialog: correct padding, WHO label font-size, and bubble padding

**Scope:** `hub/client/src/screens/Targets.css` — update three rules: `.dialog` padding to `24px 36px 120px`; `.dialog-turn__who` font-size to `10px` and `letter-spacing` to `0.18em`; `.dialog-turn__bubble` padding to `0 0 0 20px` and add `gap: 22px` between turns via parent flex container.

**Acceptance criteria:**
- `.dialog` has `padding: 24px 36px 120px`
- `.dialog-turn__who` has `font-size: 10px` and `letter-spacing: 0.18em`
- `.dialog-turn__bubble` has `padding: 0 0 0 20px` (left-only padding)
- Turn vertical rhythm comes from `gap: 22px` on the dialog container, not from bubble padding
- Test: snapshot or computed-style check confirms the three CSS property values

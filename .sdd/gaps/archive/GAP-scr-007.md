---
id: GAP-scr-007
spec-item: SPEC-scr-016
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: fac28ba6
closed-by: WI-scr-007
deferred-reason: null
---

# Targets dialog: wrong padding, WHO label font-size, and bubble padding

**Locations:**
- `hub/client/src/screens/Targets.css:341`
- `hub/client/src/screens/Targets.css:359`
- `hub/client/src/screens/Targets.css:379`

**Reasoning:** `.dialog` uses `padding: 0 24px 140px` (spec: `24px 36px 120px`); `.dialog-turn__who` uses `font-size: 9px` and `letter-spacing: 0.12em` (spec: `font-size: 10px`, `letter-spacing: 0.18em`); `.dialog-turn__bubble` uses `padding: 14px 16px` (spec: `padding: 0 0 0 20px` — left-only, with vertical rhythm from gap between turns).

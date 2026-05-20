---
id: WI-scr-002
gap-id: GAP-scr-002
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Targets archived divider: apply correct eyebrow-divider visual treatment

**Scope:** `hub/client/src/screens/Targets.css` — update `.targets-archived-divider` and `.targets-archived-divider__label` to use eyebrow-divider visual treatment: muted colour (`var(--ink-3)`/`var(--ink-4)`), uppercase tracking, `letter-spacing: 0.18em`, `font-size: 10px`, `font-weight: 500`; flanking HR lines must span full remaining width.

**Acceptance criteria:**
- `.targets-archived-divider__label` has `letter-spacing: 0.18em`, `font-weight: 500`, `text-transform: uppercase`, `font-size: 10px`
- HR rules flank the label at full width on both sides
- Visual renders: centred `· ARCHIVED N ·` label with ruled lines on each side
- Test: snapshot or visual check shows the divider matches the eyebrow-divider pattern

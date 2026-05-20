---
id: GAP-scr-002
spec-item: SPEC-scr-010
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: fac28ba6
closed-by: WI-scr-002
deferred-reason: null
---

# Targets archived divider missing eyebrow-divider visual treatment

**Location:** `hub/client/src/screens/Targets.css:496`

**Reasoning:** `.targets-archived-divider` uses a flex layout with inline `<hr>` rules and a plain uppercase label, but the label has only `letter-spacing: 0.08em` and no eyebrow-divider class — spec requires the centred `· ARCHIVED N ·` label flanked by full-width HR lines using the eyebrow-divider visual treatment (muted colour, small caps/uppercase tracking, ruled lines).

---
id: GAP-scr-004
spec-item: SPEC-scr-013
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: fac28ba6
closed-by: WI-scr-004
deferred-reason: null
---

# Targets statement body: wrong font-size and missing serif font-family

**Location:** `hub/client/src/screens/Targets.css:320`

**Reasoning:** `.statement-block__text` declares `font-size: 13px` and no `font-family`, but spec requires `font-family: var(--serif)` (Newsreader italic) at `font-size: 16px` with `line-height: 1.55`.

---
id: WI-scr-004
gap-id: GAP-scr-004
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Targets statement body: set 16px serif font

**Scope:** `hub/client/src/screens/Targets.css` — update `.statement-block__text` rule to declare `font-family: var(--serif)`, `font-style: italic`, `font-size: 16px`, `line-height: 1.55`.

**Acceptance criteria:**
- `.statement-block__text` CSS rule declares `font-family: var(--serif)` and `font-size: 16px` and `line-height: 1.55`
- Statement body renders in Newsreader italic at 16px
- Test: computed style check (or snapshot) on `.statement-block__text` confirms `font-size: 16px` and `font-family` contains serif

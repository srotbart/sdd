---
id: WI-ui-004
gap-id: GAP-ui-005
domain: ui-layout
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create design token CSS and global styles

**Scope:** `client/src/styles/tokens.css` + `client/src/styles/global.css` — define all CSS custom properties from the design handoff (surfaces, ink, hairlines, accent, status colours) and apply global resets (no shadows, hairline borders only, tabular numerals)

**Acceptance criteria:**
- All colour tokens defined: `--paper`, `--paper-2`, `--paper-3`, `--ink`, `--ink-2`, `--ink-3`, `--ink-4`, `--hair`, `--hair-2`, `--accent`, `--accent-deep`, `--accent-soft`, all `--st-*` status colours
- `box-shadow: none` applied globally; no shadow utility classes introduced
- `font-variant-numeric: tabular-nums` set globally
- Google Fonts import present: Newsreader, Geist, JetBrains Mono
- Test: computed style of a rendered element confirms `--ink` resolves to `#18181a`

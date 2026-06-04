---
id: SPEC-ui-018
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "a2ee1790"
---

# SPEC-ui-018 — Dark theme is a complete alternative token set applied at the root

## Invariant

The Hub supports a dark theme implemented entirely as an alternative set of values for the existing CSS custom properties in `hub/client/src/styles/tokens.css` (surfaces `--paper*`, ink `--ink*`, hairlines `--hair*`, accent `--accent*`, status `--st-*`). The dark values are declared under a single root selector (a `[data-theme="dark"]` attribute or equivalent class on the document root / app shell). Switching that root attribute restyles the entire application — no component defines its own dark-mode colours.

## Acceptance criteria

- Every colour token defined in `:root` has a corresponding dark value under the dark-theme selector
- Setting the dark theme attribute on the root element visually switches the whole app to dark surfaces and light ink
- No component CSS contains a dark-mode-specific colour rule; the swap happens only through the token redefinition
- Removing/!resetting the attribute returns the app to the light ("paper") theme with no residual dark styles

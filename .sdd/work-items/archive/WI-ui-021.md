---
id: WI-ui-021
gap-id: GAP-ui-021
domain: ui-layout
status: done
created: "2026-06-04T00:00:00Z"
closed: null
abandoned-reason: null
---

# WI-ui-021 — Add dark-theme token set to tokens.css

**Scope:** `hub/client/src/styles/tokens.css` — add a `[data-theme="dark"]` selector block that redefines every colour token (`--paper*`, `--ink*`, `--hair*`, `--accent*`, `--st-*`) with dark-appropriate values; dark surfaces are near-black, ink is near-white, status and accent colours remain legible.

**Acceptance criteria:**
- `[data-theme="dark"]` selector present in `tokens.css` with an override for every token defined in `:root`
- Setting `document.documentElement.setAttribute('data-theme', 'dark')` in tests switches surface tokens to dark values and ink tokens to light values
- Status tokens (`--st-*`) remain distinguishable (not identical to surface or each other) under the dark set
- Removing the attribute restores light-theme values with no residual dark styles
- Unit test: verify `[data-theme="dark"]` block lists all required token names (snapshot or explicit assertions)

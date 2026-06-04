---
id: SPEC-ui-021
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "dc0d85ff"
---

# SPEC-ui-021 — Component colours derive from tokens; dark values stay legible

## Invariant

For the theme swap (SPEC-ui-018) to be complete, all component colours must derive from the shared CSS custom properties rather than hardcoded colour literals. Any component CSS using a raw colour where a token exists is migrated to the token. The dark-theme token values are tuned so that status colours (`--st-*` and the passing/failing/missing/skipped indicators), the accent, and ink remain legible and reasonably contrasty on dark surfaces.

## Acceptance criteria

- Component CSS under `hub/client/src` uses `var(--token)` for colours that have a token; no hardcoded hex/rgb where a token exists
- Status indicators (test-status dots, status pills) and the accent remain clearly distinguishable and legible on dark surfaces
- Ink-on-surface text in dark mode meets a reasonable contrast bar (not pure-black ink on dark surfaces)
- Switching between light and dark leaves no element with an unreadable or off-theme colour

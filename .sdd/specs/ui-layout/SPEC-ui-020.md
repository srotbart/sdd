---
id: SPEC-ui-020
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "6fd55da3"
---

# SPEC-ui-020 — Active theme is applied before first paint (no flash)

## Invariant

The resolved theme (from stored preference, or the OS preference in system mode) is applied to the document root before the application's first paint, so the user never sees a flash of the light theme before dark mode takes effect (or vice versa).

## Acceptance criteria

- The root theme attribute is set before React renders the app / before first paint, not in a post-mount effect
- On reload with dark (or system-dark) selected, the initial paint is already dark — no visible light flash
- The pre-paint resolution reads the same persisted preference key used by the toggle (SPEC-ui-019)

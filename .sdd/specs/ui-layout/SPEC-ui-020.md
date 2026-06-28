---
id: SPEC-ui-020
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "1cd988d2"
---

# SPEC-ui-020 — Active theme is applied before first paint (no flash)

## Invariant

The resolved theme (from stored preference, or the OS preference in system mode) is applied to the document root before the application's first paint, so the user never sees a flash of the light theme before dark mode takes effect (or vice versa).

## Acceptance criteria

- The root theme attribute is set before React renders the app / before first paint, not in a post-mount effect
- On reload with dark (or system-dark) selected, the initial paint is already dark — no visible light flash
- The pre-paint resolution reads the same persisted preference key used by the toggle (SPEC-ui-019)

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-020 — inline script applies theme before first paint > SPEC-ui-020: index.html contains an inline script in <head> before the module script tag` — inline script appears before the module script in <head>
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-020 — inline script applies theme before first paint > SPEC-ui-020: script references the hub.themeMode localStorage key` — the inline script reads hub.themeMode
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-020 — inline script applies theme before first paint > SPEC-ui-020: stored "dark" sets data-theme="dark" regardless of OS preference` — stored dark overrides OS preference
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-020 — inline script applies theme before first paint > SPEC-ui-020: stored "light" leaves data-theme absent even when OS prefers dark` — stored light ignores dark OS
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-020 — inline script applies theme before first paint > SPEC-ui-020: stored "system" with dark OS preference sets data-theme="dark"` — system + dark OS applies dark theme
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-020 — inline script applies theme before first paint > SPEC-ui-020: stored "system" with light OS preference leaves data-theme absent` — system + light OS leaves theme absent
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-020 — inline script applies theme before first paint > SPEC-ui-020: no stored preference with dark OS (defaults to system) sets data-theme="dark"` — no stored key defaults to system; dark OS applies dark theme
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-020 — inline script applies theme before first paint > SPEC-ui-020: no stored preference with light OS leaves data-theme absent` — no stored key with light OS leaves theme absent

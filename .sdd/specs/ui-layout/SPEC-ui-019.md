---
id: SPEC-ui-019
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "4e5f974b"
---

# SPEC-ui-019 — Theme mode is light / dark / system, toggleable and persisted

## Invariant

The user can choose between three theme modes — light, dark, and system — via a toggle control in the UI. The chosen mode persists across reloads (stored in `localStorage`). In "system" mode the active theme follows the OS `prefers-color-scheme` and updates live when the OS preference changes. Light and dark modes pin the theme regardless of OS preference.

## Acceptance criteria

- A user-facing control switches between light, dark, and system modes
- The selected mode is written to `localStorage` and restored on next load
- "system" mode resolves to dark when `prefers-color-scheme: dark` and light otherwise, and reacts to OS preference changes without a reload
- Selecting light or dark explicitly overrides the OS preference
- The control reflects the currently active mode

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-019 — Header theme toggle control > SPEC-ui-019: header renders a theme-toggle button` — the Header renders a .header-theme-toggle button
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-019 — Header theme toggle control > SPEC-ui-019: toggle button aria-label reflects current mode` — the toggle button aria-label contains the current mode name
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-019 — Header theme toggle control > SPEC-ui-019: clicking toggle cycles mode from system → light` — clicking the toggle advances mode from system to light and persists to localStorage
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-019 — Header theme toggle control > SPEC-ui-019: clicking from light → dark applies data-theme="dark"` — clicking from light mode sets data-theme="dark" and saves dark to localStorage
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme sets data-theme for each mode > SPEC-ui-019: light mode removes data-theme attribute` — light mode removes data-theme from documentElement
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme sets data-theme for each mode > SPEC-ui-019: dark mode sets data-theme="dark"` — dark mode sets data-theme="dark" on documentElement
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme sets data-theme for each mode > SPEC-ui-019: system mode with dark OS preference sets data-theme="dark"` — system mode with prefers-dark resolves to dark theme
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme sets data-theme for each mode > SPEC-ui-019: system mode with light OS preference removes data-theme` — system mode with light OS leaves data-theme absent
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme reads persisted mode from localStorage on mount > SPEC-ui-019: defaults to system mode when no key is stored` — no stored key defaults to system mode
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme reads persisted mode from localStorage on mount > SPEC-ui-019: restores stored dark mode on mount` — stored "dark" is read on mount and applies dark theme
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme reads persisted mode from localStorage on mount > SPEC-ui-019: restores stored light mode on mount` — stored "light" is read on mount
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme reads persisted mode from localStorage on mount > SPEC-ui-019: setMode writes to localStorage` — setMode persists the new mode key
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme system mode responds to matchMedia change event > SPEC-ui-019: switching OS to dark while in system mode applies data-theme="dark"` — live OS change to dark applies dark theme
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme system mode responds to matchMedia change event > SPEC-ui-019: switching OS to light while in system mode removes data-theme` — live OS change to light removes dark theme
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme system mode responds to matchMedia change event > SPEC-ui-019: non-system mode does not attach a matchMedia listener` — light/dark modes do not attach a media listener
- `hub/client/src/hooks/useTheme.test.ts > SPEC-ui-019 — useTheme system mode responds to matchMedia change event > SPEC-ui-019: listener is removed when hook unmounts in system mode` — the matchMedia listener is removed on unmount

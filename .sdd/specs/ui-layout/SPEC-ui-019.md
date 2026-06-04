---
id: SPEC-ui-019
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "ef8328e3"
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

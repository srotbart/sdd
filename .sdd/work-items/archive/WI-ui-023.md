---
id: WI-ui-023
gap-id: GAP-ui-023
domain: ui-layout
status: done
created: "2026-06-04T00:00:00Z"
closed: null
abandoned-reason: null
---

# WI-ui-023 — Apply theme attribute before first paint via inline script in index.html

**Scope:** `hub/client/index.html` — add a small inline `<script>` in `<head>` (before any stylesheet or module script) that reads `localStorage.getItem('hub.themeMode')`, resolves system mode via `matchMedia`, and sets `document.documentElement.setAttribute('data-theme', ...)` synchronously so the correct theme is applied before React loads.

**Acceptance criteria:**
- `index.html` contains an inline script in `<head>` that sets `data-theme` on `<html>` before the module script tag
- The script reads the same `hub.themeMode` key used by the `useTheme` hook (SPEC-ui-019 / WI-ui-022)
- For `"system"` stored preference, the script uses `matchMedia('(prefers-color-scheme: dark)')` to resolve the active theme
- For `"dark"` stored preference, the script sets `data-theme="dark"` unconditionally
- For `"light"` or no stored preference, no `data-theme` attribute is set (defaults to light)
- Unit test: document-level test verifies `data-theme` is set before `DOMContentLoaded` fires (or equivalent jsdom assertion that the attribute is present immediately after script execution without waiting for React mount)

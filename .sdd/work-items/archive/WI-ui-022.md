---
id: WI-ui-022
gap-id: GAP-ui-022
domain: ui-layout
status: done
created: "2026-06-04T00:00:00Z"
closed: null
abandoned-reason: null
---

# WI-ui-022 — Add theme-mode toggle (light/dark/system) with localStorage persistence

**Scope:** `hub/client/src/components/Header.tsx` and a new `hub/client/src/hooks/useTheme.ts` — implement a `useTheme` hook that reads/writes `localStorage` key `hub.themeMode` (values: `"light"`, `"dark"`, `"system"`), applies `data-theme` on `document.documentElement`, listens to `prefers-color-scheme` changes in system mode, and exposes a setter; wire a three-state toggle button into `Header` that cycles through the modes.

**Acceptance criteria:**
- Toggle control renders in the header and shows the current mode
- Clicking cycles through light → dark → system → light (or equivalent three-state interaction)
- Selected mode is written to `localStorage` under `hub.themeMode` and restored on mount
- In system mode, `document.documentElement` gets `data-theme="dark"` when `matchMedia('(prefers-color-scheme: dark)').matches` is true, and reacts live to changes without a reload
- Light/dark modes pin the attribute regardless of OS preference
- Unit test: `useTheme` sets `data-theme` attribute correctly for each mode
- Unit test: `useTheme` reads persisted mode from `localStorage` on mount
- Unit test: system mode responds to a `matchMedia` change event (mock `window.matchMedia`)

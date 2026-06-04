---
id: GAP-ui-022
spec-item: SPEC-ui-019
domain: ui-layout
status: closed
discovered: "2026-06-04T00:00:00Z"
audit-spec-version: "ef8328e3"
closed-by: WI-ui-022
deferred-reason: null
---

# Gap: No theme-mode toggle or persistence logic exists

**Location:** `hub/client/src/components/Header.tsx:1`

**Reasoning:** Neither `Header.tsx`, `Settings.tsx`, nor any other component exposes a light/dark/system mode toggle, reads a theme preference from `localStorage`, or listens to `prefers-color-scheme` changes — the entire theme selection, persistence, and system-follow mechanism is absent.

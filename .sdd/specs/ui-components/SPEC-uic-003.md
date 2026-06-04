---
id: SPEC-uic-003
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "4318f990"
---

# SPEC-uic-003 — TestStatusDot is a shared component for spec item test status

`hub/client/src/components/TestStatusDot.tsx` renders a small filled circle and an always-visible dimmed timestamp string. Props: `status: "passing" | "failing" | "missing" | "not-run"`, `lastRun?: string`. Colors: passing → `#4caf50` (green), failing → `#f44336` (red), missing → `#ff9800` (amber), not-run → `#9e9e9e` (gray). The timestamp is formatted as `YYYY-MM-DD HH:mm` in the user's local time; omitted when `status` is `not-run`. The component is rendered inline on the spec item ID line, between the spec ID and the existing `StatusPill`, on every spec item regardless of status.

**Tests:**
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-003 TestStatusDot status dot > SPEC-uic-003: renders the documented color per status` — each status renders its documented circle color and a matching aria-label.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-003 TestStatusDot status dot > SPEC-uic-003: formats lastRun as YYYY-MM-DD HH:mm and omits the timestamp for not-run` — timestamp uses the YYYY-MM-DD HH:mm format and is dropped for not-run.

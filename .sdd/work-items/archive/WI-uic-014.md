---
id: WI-uic-014
gap-id: GAP-uic-011
domain: ui-components
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Fix TestStatusDot to show placeholder when lastRun absent for non-not-run status

**Scope:** `hub/client/src/components/TestStatusDot.tsx:28` — change `showTime = status !== 'not-run' && lastRun` to always render the timestamp span for non-`not-run` status; when `lastRun` is absent, render a placeholder such as `—` instead of nothing.

**Acceptance criteria:**
- A `TestStatusDot` with `status: "missing"` and no `lastRun` renders a visible timestamp element (not empty)
- A `TestStatusDot` with `status: "not-run"` renders no timestamp element
- A `TestStatusDot` with `status: "passing"` and a `lastRun` value renders the formatted timestamp
- Unit test: status="missing", no lastRun → timestamp element present with placeholder content
- Unit test: status="not-run" → no timestamp element rendered
- Unit test: status="passing", lastRun="2026-05-28T08:00:00.000Z" → timestamp element present with formatted text

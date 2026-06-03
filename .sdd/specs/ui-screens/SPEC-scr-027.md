---
id: SPEC-scr-027
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "80b9ab67"
---

# SPEC-scr-027 — Specs screen renders TestStatusDot next to each spec item ID

In `hub/client/src/screens/Specs.tsx`, the spec item ID line renders `<TestStatusDot status={item.testStatus.status} lastRun={item.testStatus.lastRun} />` between the `<span className="specs-item__id">` element and the existing `<StatusPill>`. The dot and timestamp are always rendered for every spec item; conditional hiding is not permitted. The `SpecItem` type in `hub/client/src/types.ts` gains a non-optional `testStatus: { status: "passing" | "failing" | "missing" | "not-run"; lastRun?: string }` field.

**Tests:**
- `hub/client/src/screens/Specs.test.tsx > Specs screen TestStatusDot (SPEC-scr-027) > renders a TestStatusDot for every spec item in the list` — "TestStatusDot is rendered for every spec item in the list"

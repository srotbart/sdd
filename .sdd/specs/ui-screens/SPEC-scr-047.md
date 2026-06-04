---
id: SPEC-scr-047
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "ac0ce9a6"
---

# SPEC-scr-047 — Skipped spec items are surfaced distinctly from not-run

## Invariant

A spec item that has been deliberately skipped during spec-test coverage (no meaningful code boundary) is surfaced in the UI as a distinct `skipped` state, visually and semantically different from `not-run` (an item that simply has no test results yet). A skip is recorded via a convention in the spec item file — a `**Tests:** skipped — <reason>` line — which the spec parser reads and exposes on the item, and the skip reason is shown in the spec-item detail view. Skipped items are excluded from the "uncovered, needs tests" reading of coverage.

## Acceptance criteria

- The spec parser recognises a `**Tests:** skipped — <reason>` convention and exposes a `skipped` flag plus the reason on the parsed spec item
- The Specs screen and spec-item detail render `skipped` distinctly from `not-run` (distinct indicator, not the same gray dot)
- The skip reason text is visible in the spec-item detail view
- The per-domain coverage summary (SPEC-scr-046) counts skipped items separately from not-run / missing
- An item with no `**Tests:**` block and no skip marker still renders as not-run / uncovered as before

**Tests:**
- `hub/server/sdd-parse-specs.test.ts > parseSpecs — SPEC-scr-047: skipped test state > skipped status is preserved even when a .tests.json mapping exists — skip wins over computed status` — "an explicit skip overrides any mapping-computed status"
- `hub/server/sdd-parse-specs.test.ts > parseSpecs — SPEC-scr-047: skipped test state > item with no **Tests:** block still gets status=not-run` — "an unmarked item stays not-run, distinct from skipped"
- `hub/client/src/components/TestStatusDot.test.tsx > TestStatusDot — skipped status (SPEC-scr-047) > skipped status renders circle with blue color distinct from not-run gray` — "skipped renders a distinct blue dot, not the not-run gray"
- `hub/client/src/components/TestStatusDot.test.tsx > TestStatusDot — skipped status (SPEC-scr-047) > skipped status with skipReason includes reason in the title tooltip` — "the skip reason appears in the dot tooltip"
- `hub/client/src/screens/SpecItemDetail.test.tsx > SpecItemDetail — skipped status (SPEC-scr-047) > renders the skip reason when item has skipped status` — "detail view shows the skip reason text"

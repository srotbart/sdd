---
id: GAP-scr-035
spec-item: SPEC-scr-039
domain: ui-screens
abbrev: scr
status: closed
discovered: "2026-06-01T00:00:00Z"
audit-spec-version: "53cf94c0"
closed-by: WI-scr-036
deferred-reason: null
---

# GAP-scr-035 — Spec item list renders body as plain text, not markdown; no line-clamp applied

**Locations:**
- `hub/client/src/screens/SpecItemList.tsx:43`
- `hub/client/src/screens/Specs.css:207`

**Reasoning:** `SpecItemList.tsx:43` renders `item.body` inside a `<p>` tag (plain text), not via `react-markdown`; `Specs.css` declares `.specs-item__body` without `-webkit-line-clamp: 5` or `overflow: hidden`, so bodies are neither markdown-rendered nor capped at 5 lines.

---
id: GAP-scr-036
spec-item: SPEC-scr-039
status: closed
discovered: "2026-06-01T00:00:00Z"
audit-spec-version: 5b22e3ea
closed-by: WI-scr-037
deferred-reason: null
---

# Spec item list renders body as plain text, not markdown

**Location:** `hub/client/src/screens/SpecItemList.tsx:43`

**Reasoning:** `<p className="specs-item__body">{item.body}</p>` renders the body as a plain text string — `react-markdown` is not used, so markdown syntax (bold, code) is displayed literally rather than as HTML elements.

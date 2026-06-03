---
id: WI-scr-036
gap-id: GAP-scr-035
domain: ui-screens
abbrev: scr
status: done
created: "2026-06-01T00:00:00Z"
closed: "2026-06-01T00:00:00Z"
abandoned-reason: null
---

# WI-scr-036 — Render spec item body via react-markdown and cap at 5 lines in SpecItemList

**Scope:** `hub/client/src/screens/SpecItemList.tsx:43` — replace the plain `<p>{item.body}</p>` with `<ReactMarkdown>{item.body}</ReactMarkdown>` wrapped in `.specs-item__body`; add `-webkit-line-clamp: 5`, `display: -webkit-box`, `-webkit-box-orient: vertical`, and `overflow: hidden` to `.specs-item__body` in `hub/client/src/screens/Specs.css`

**Acceptance criteria:**
- Each `.specs-item__body` in the list renders markdown (e.g. `**bold**` produces `<strong>`, backtick code produces `<code>`)
- The body container has `-webkit-line-clamp: 5` and `overflow: hidden` so content beyond 5 lines is not visible
- No "read more" or expand control is rendered in the list row
- Clicking the row still opens the full detail view with the untruncated body
- Test: `hub/client/src/screens/Specs.test.tsx` covers markdown rendering in list row (bold becomes `<strong>`) and clamp CSS on `.specs-item__body`

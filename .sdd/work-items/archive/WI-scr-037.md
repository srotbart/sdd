---
id: WI-scr-037
gap-id: GAP-scr-036
status: done
created: "2026-06-01T00:00:00Z"
abandoned-reason: null
---

# Render spec item body via react-markdown in SpecItemList

**Scope:** `hub/client/src/screens/SpecItemList.tsx:43` — replace `<p className="specs-item__body">{item.body}</p>` with `<ReactMarkdown>{item.body}</ReactMarkdown>` wrapped in `.specs-item__body`

**Acceptance criteria:**
- `SpecItemList` imports `ReactMarkdown` from `react-markdown`
- Each item body is rendered via `<ReactMarkdown>` not a plain `<p>` text node
- Markdown syntax renders as HTML: `**bold**` produces `<strong>`, backtick code produces `<code>`
- The body container retains `.specs-item__body` class so the existing `-webkit-line-clamp: 5` CSS applies
- Test: `.specs-item__body` contains a `<strong>` element when the body includes `**bold**` markdown

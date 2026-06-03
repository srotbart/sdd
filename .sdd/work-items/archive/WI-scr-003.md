---
id: WI-scr-003
gap-id: GAP-scr-002
domain: ui-screens
status: done
created: "2026-05-29T00:00:00Z"
abandoned-reason: null
---

# Work Item: Install react-markdown and create SpecItemList/SpecItemDetail components

**Scope:** `hub/client/package.json`, `hub/client/src/screens/SpecItemList.tsx`, `hub/client/src/screens/SpecItemDetail.tsx` — add `react-markdown` dependency; extract the item list rendering into `SpecItemList` and create `SpecItemDetail` with a `← items` back button, item header (mono-accent ID, StatusPill, open-gap pill, TestStatusDot), Newsreader serif title, `react-markdown`-rendered body in `.spec-item-detail__body`, and gap/WI ref pills.

**Acceptance criteria:**
- `react-markdown` appears in `package.json` `dependencies`
- `SpecItemList.tsx` exists and renders the list of spec items for a domain
- `SpecItemDetail.tsx` exists with a `← items` back button, item header, title, markdown body, and ref pills
- Item body is rendered via `react-markdown` wrapped in `.spec-item-detail__body`
- Domain sidebar remains visible in the detail view
- Unit test: `SpecItemDetail` renders the back button
- Unit test: `SpecItemDetail` renders the item body as markdown (e.g., `**bold**` → `<strong>`)

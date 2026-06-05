---
id: WI-uic-020
gap-id: GAP-uic-017
domain: ui-components
status: done
created: "2026-06-05T13:45:00Z"
abandoned-reason: null
---

# Work Item: Create shared Markdown component with remark-gfm and refactor all call sites

**Scope:** `hub/client/src/components/Markdown.tsx` — create shared component wrapping `react-markdown` with `remarkPlugins={[remarkGfm]}`; refactor `SpecItemDetail.tsx`, `SpecItemList.tsx`, `Targets.tsx`, `Designs.tsx`, `Projections.tsx` to use it.

**Acceptance criteria:**
- `hub/client/src/components/Markdown.tsx` exists and wraps `react-markdown` with `remark-gfm`; raw HTML (rehype-raw) is NOT enabled
- All five screens import `Markdown` from the shared component; no direct `react-markdown` import remains in any screen
- `remark-gfm` is listed in `hub/client/package.json` dependencies
- Unit test (SPEC-uic-013): GFM table input renders an HTML `<table>` element
- Unit test (SPEC-uic-013): strikethrough `~~text~~` renders `<del>` element
- Unit test (SPEC-uic-013): task list `- [ ] item` renders a checkbox input
- All 502 existing hub/client tests continue to pass

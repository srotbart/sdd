---
id: GAP-scr-001
spec-item: SPEC-scr-052
domain: ui-screens
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "8d7e3161"
closed-by: WI-scr-052
deferred-reason: null
---

# Gap: tabCounts in App.tsx omits issues, improvements, projections, designs, and standards counts

**Locations:**
- `hub/client/src/App.tsx:472-477` — `tabCounts` prop passed to `Sidenav` only includes `targets`, `gaps`, `work items`, `specs`; `issues`, `improvements`, `projections`, `designs`, and `standards` are absent
- `hub/client/src/App.tsx` — no `liveProjections`, `liveDesigns`, or `liveStandards` state arrays exist to source counts for those tabs; they are fetched internally by their screens
- `hub/client/src/App.test.tsx` — no SPEC-scr-052 tests covering the five missing tab count badges

**Reasoning:** The `tabCounts` object is missing five artifact-bearing tabs so their sidenav badges never render; issues/improvements need active-status filtering and projections/designs/standards need document-count state that App.tsx does not yet maintain.

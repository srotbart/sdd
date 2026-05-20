---
id: GAP-ui-008
spec-item: SPEC-ui-009
domain: ui-layout
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "e0a2c55c"
closed-by: WI-ui-008
deferred-reason: null
---

# Gap: Plugin reference section scrolls with sidenav content instead of pinned to bottom

**Location:** `hub/client/src/components/Sidenav.css:1-12`

**Reasoning:** `.sidenav` has `overflow-y: auto`, so when content overflows the `.sidenav-plugin-ref-section`'s `margin-top: auto` cannot pin it to the absolute bottom — the entire content block (including the plugin-ref row) scrolls together rather than the plugin-ref remaining fixed at the bottom edge.

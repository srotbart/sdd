---
id: GAP-ui-006
spec-item: SPEC-ui-007
domain: ui-layout
status: closed
discovered: "2026-05-15T00:00:00Z"
audit-spec-version: "ab05a971"
closed-by: WI-ui-005
deferred-reason: null
---

# Gap: Workspace selector is a static list, not a dropdown

**Location:** client/src/components/Sidenav.tsx — workspace rows are plain buttons with no dropdown panel or chevron

**Reasoning:** The sidenav renders all workspace rows permanently; there is no dropdown trigger, panel, or open/close state.

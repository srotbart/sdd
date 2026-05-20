---
id: GAP-scr-009
spec-item: SPEC-scr-018
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: fac28ba6
closed-by: WI-scr-009
deferred-reason: null
---

# Sidenav item counts not computed — tabCounts always passed as empty object

**Location:** `hub/client/src/App.tsx:226`

**Reasoning:** `tabCounts={}` is hardcoded as an empty object in the `<Sidenav>` call — no count computation is performed from live targets, gaps, or work items, so sidenav badges for Targets, Gaps, Work Items, and Specs always show nothing.

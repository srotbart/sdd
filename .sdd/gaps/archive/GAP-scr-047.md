---
id: GAP-scr-047
spec-item: SPEC-scr-049
domain: ui-screens
status: closed
discovered: "2026-06-05T01:30:00Z"
audit-spec-version: "99416b0d"
closed-by: WI-scr-049
deferred-reason: null
---

# Gap: Specs screen sidebar rows show no TestStatusDot for the domain's rolled-up test status

**Location:** `hub/client/src/screens/Specs.tsx:114`

**Reasoning:** Each `specs-domain-row` in the sidebar renders only the domain name, meta text, and item count — no `TestStatusDot` reflecting the aggregate test status is rendered.

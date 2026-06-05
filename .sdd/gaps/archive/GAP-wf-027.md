---
id: GAP-wf-027
spec-item: SPEC-wf-029
domain: workflow
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "e55da335"
closed-by: WI-wf-026
deferred-reason: null
---

# Gap: No lint/CI gate scaffold for mechanically-checkable coding standards

**Location:** `plugin/` — no lint configuration, no CI gate script, no pre-commit hook scaffold exists
**Reasoning:** No lint/format step or CI gate blocking mechanically-checkable standards violations is scaffolded; SPEC-wf-029's active-blocking enforcement layer is absent.

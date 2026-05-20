---
id: GAP-scr-015
spec-item: SPEC-scr-016
domain: ui-screens
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "379b301b"
closed-by: WI-scr-015
deferred-reason: null
---

# Gap: Dialog turn bubble font-size is 13px, not 14px

**Location:** hub/client/src/screens/Targets.css:416

**Reasoning:** `.dialog-turn__body` declares `font-size: 13px` but SPEC-scr-016 requires `font-size: 14px` for turn bubbles.

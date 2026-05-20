---
id: GAP-scr-008
spec-item: SPEC-scr-017
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: fac28ba6
closed-by: WI-scr-008
deferred-reason: null
---

# PluginReference screen does not exist

**Location:** `hub/client/src/App.tsx:1`

**Reasoning:** No `PluginReference` component exists anywhere in the codebase; it is not imported in App.tsx, not listed in the sidenav NAV_TABS, and no screen file exists at `hub/client/src/screens/PluginReference.tsx`.

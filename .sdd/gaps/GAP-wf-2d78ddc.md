---
id: GAP-wf-2d78ddc
spec-item: SPEC-wf-035
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "e3ca1fbe"
closed-by: WI-wf-f7bf4e6
deferred-reason: null
---

# Gap: PluginReference screen misstates the artifact model (archive, IDs, missing types)

**Locations:**
- `hub/client/src/screens/PluginReference.tsx:30` — the SPEC artifact card says specs are "Never archived", and `PluginReference.tsx:77` (DESIGN_DECISIONS) repeats "Specs are never archived"; false per SPEC-wf-035 — deprecated/aliased spec items DO move to the tracked spec archive (`.sdd/specs/**/archive/`). Active specs are durable; the archive exists and stays tracked.
- `hub/client/src/screens/PluginReference.tsx:48` — GAP_SCHEMA/WI_SCHEMA examples show only legacy `{seq}` IDs (`GAP-scr-001`, `WI-scr-001`); per SPEC-wf-037 ephemeral artifacts mint `{7hex}` IDs (both forms valid).
- `hub/client/src/screens/PluginReference.tsx:28` — the ARTIFACTS list and `LIFECYCLE_ROWS` omit the Issue (ISS) and Improvement (IMP) artifact types (SPEC-wf-025 / SPEC-wf-026).

**Reasoning:** The reference screen presents a stale artifact model — the "never archived" claim contradicts SPEC-wf-035's tracked spec archive, and it predates hash IDs (SPEC-wf-037) and the issues/improvements artifact types (SPEC-wf-025/026).

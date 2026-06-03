---
id: WI-ui-017
gap-id: GAP-ui-017
domain: ui-layout
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Uppercase status chips in AttachWorkspaceDialog

**Scope:** `hub/client/src/components/AttachWorkspaceDialog.tsx:127` — change chip text from `'sdd ready'` / `'fresh'` to `'SDD READY'` / `'FRESH'` to match the spec's `● FRESH` / `● SDD READY` uppercase requirement.

**Acceptance criteria:**
- Chip text renders as `SDD READY` (not `sdd ready`) when `hasSdd` is true
- Chip text renders as `FRESH` (not `fresh`) when `hasSdd` is false
- Unit test: dialog with a recent folder that has `hasSdd: true` renders `SDD READY` chip
- Unit test: dialog with a recent folder that has `hasSdd: false` renders `FRESH` chip

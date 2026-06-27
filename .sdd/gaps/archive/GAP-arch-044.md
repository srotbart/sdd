---
id: GAP-arch-044
spec-item: SPEC-arch-018
domain: architecture
status: closed
discovered: "2026-06-27T23:18:20Z"
audit-spec-version: "593aa2bf"
closed-by: WI-arch-041
deferred-reason: null
---

# Gap: issues/improvements/standards changes are not broadcast or handled live

**Locations:**
- `hub/server/sdd-artifact.ts:4`
- `hub/server/ws-ui.ts:6`
- `hub/client/src/App.tsx:304`
- `hub/client/src/screens/Standards.tsx:49`

**Reasoning:** `resolveArtifact` (and the `SddArtifact` type) omit `issues`, `improvements`, and `standards`, so changes under those dirs emit no `sdd-changed` event, and the client `onmessage` handler has no branch for them — violating SPEC-arch-018's invariant that artifact changes are broadcast to UI clients, so those three artifact types never refresh live.

---
id: GAP-arch-020
spec-item: SPEC-arch-018
domain: architecture
abbrev: arch
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "7ce13ed5"
closed-by: WI-arch-018
deferred-reason: null
---

# Gap: sdd-changed WebSocket event not broadcast to UI clients

**Location:** `hub/client/src/App.tsx:281` — WebSocket `onmessage` handler is absent; the client only sets `hubConnected` state and never re-fetches artifact endpoints in response to any server push

**Note (2026-05-18):** Server-side implementation is now complete — `broadcastSddChanged` is exported from `ws-ui.ts:71`, `resolveArtifact` maps paths to artifact types in `sdd-artifact.ts:11`, and the watcher callback in `index.ts:194` calls `broadcastSddChanged(id, artifact)` for each `.sdd/` change. The remaining gap is client-only.

**Reasoning:** `App.tsx` WebSocket `useEffect` (line 278) sets `onopen`/`onclose`/`onerror` but has no `onmessage` handler, so `sdd-changed` events emitted by the server are silently discarded and no re-fetch occurs.

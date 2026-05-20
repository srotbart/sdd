---
id: WI-ui-009
gap-id: GAP-ui-009
domain: ui-layout
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Track WebSocket connection state and reflect it in the hub overview dot

**Scope:** `hub/client/src/App.tsx` — add WebSocket connection state tracking and pass an `isConnected` boolean to `Sidenav`; `hub/client/src/components/Sidenav.tsx:76` — replace hardcoded `sidenav-dot--idle` with conditional `sidenav-dot--active` / `sidenav-dot--idle` based on the prop

**Acceptance criteria:**
- `App.tsx` opens a WebSocket to the hub server and tracks connection state (`connected` / `disconnected`)
- `isConnected` prop (boolean) is added to `SidenavProps` and threaded from `App` to `Sidenav`
- Hub overview dot renders `sidenav-dot--active` when connected and `sidenav-dot--idle` when disconnected
- Dot reverts to idle on WebSocket close or error without crashing the app
- Component test: Sidenav renders `sidenav-dot--active` when `isConnected=true` and `sidenav-dot--idle` when `isConnected=false`

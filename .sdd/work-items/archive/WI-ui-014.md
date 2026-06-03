---
id: WI-ui-014
gap-id: GAP-ui-014
domain: ui-layout
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Replace RECENT_FOLDERS constant with live fetch from GET /recent-workspaces

**Scope:** `hub/client/src/components/AttachWorkspaceDialog.tsx` — delete the `RECENT_FOLDERS` constant; add `useState<RecentFolder[]>([])` for recent folders; add `useEffect` that fetches `GET /recent-workspaces` on mount, maps the response to `RecentFolder[]`, and sets state; if the fetch fails or returns empty, the recent folders state remains empty and the RECENT FOLDERS section is hidden

**Acceptance criteria:**
- `RECENT_FOLDERS` constant is deleted
- `GET /recent-workspaces` is fetched when the dialog mounts
- Recent folders section is hidden when the response is empty or fetch fails
- Unit test: successful fetch populates the recent folders list
- Unit test: failed fetch hides the recent folders section

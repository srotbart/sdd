---
id: WI-arch-011
gap-id: GAP-arch-014
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Parse spec files and serve via GET /workspaces/:id/specs; wire Specs screen

**Scope:** `server/sdd-parser.ts` (new) + `server/index.ts` + `client/src/screens/Specs.tsx`

**Acceptance criteria:**
- `server/sdd-parser.ts` exports `parseSpecs(sddPath: string): Spec[]` that reads `SPEC-*.md` files, parses frontmatter and spec items
- Each spec item includes: id, title, status (active/deprecated), body, refs (GAP-* and WI-* IDs from trailing ref-pill lines)
- `GET /workspaces/:id/specs` returns 404 for unknown workspace, empty array when no spec files, parsed specs otherwise
- Specs screen fetches from this endpoint on mount when a workspace is active; falls back to empty state gracefully
- Test: parseSpecs run against the sdd-hub workspace's own .sdd/specs/ returns at least 3 spec files with items

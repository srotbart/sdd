---
id: WI-wf-7e1d4b9
gap-id: GAP-wf-d9b2e56
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Update gap.md and work-item.md artifact guides to document hash ID minting

**Scope:** `plugin/references/artifacts/gap.md` and `plugin/references/artifacts/work-item.md` — replace sequential ID minting instructions with hash ID (`{7hex}`) minting instructions; remove archive-scan steps

**Acceptance criteria:**
- `gap.md` Schema / ID Convention section shows `GAP-{abbrev}-{7hex}` in file path and ID pattern
- `gap.md` Operating Procedure step 4 instructs hash minting (`openssl rand -hex 4 | cut -c1-7`), no archive/max-seq scan
- `work-item.md` Schema / ID Convention section shows `WI-{abbrev}-{7hex}` in file path and ID pattern
- `work-item.md` Schema removes the "number from the max across both..." archive-scan sentence
- Both guides retain all 6 required sections (check-artifact-guides.js still exits 0)
- Test: `node plugin/scripts/check-artifact-guides.js` exits 0 after changes
- Test: add or update a hub/server test asserting neither gap.md nor work-item.md contains "next sequential ID" or "from the max across"

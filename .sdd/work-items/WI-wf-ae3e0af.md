---
id: WI-wf-ae3e0af
gap-id: GAP-wf-2ca4e03
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Mention close-domain as the execution loop driver in README

**Scope:** `README.md` (~lines 31–34, "Concrete skill chain" prose) — mention `close-domain` as the execution loop the worker drives (spawn-sdd-worker hands off to close-domain, which drives audit → decompose → close → guardian audit). Do NOT touch the "## Skills" table (generated; already aligned). Documentation only.

**Acceptance criteria:**
- The README pipeline prose names `close-domain` as the execution loop driver alongside spawn-sdd-worker
- The generated "## Skills" table is left untouched; `node plugin/scripts/check-skills-drift.js` still exits 0

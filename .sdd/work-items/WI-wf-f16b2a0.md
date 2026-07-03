---
id: WI-wf-f16b2a0
gap-id: GAP-wf-87f7c1d
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Refresh sdd-help walkthrough (hash ID + close-domain one-shot)

**Scope:** `plugin/skills/sdd-help/SKILL.md` — (a) update the step-6 example (and the "Typical First Session" block) from the legacy `WI-auth-001` to a `{7hex}` form (e.g. `WI-auth-3f9c2a1`); (b) add the close-domain one-shot alternative alongside steps 4–6 (e.g. "or run `/sdd:close-domain authentication` to drive 4–6 in one loop"). Documentation only. Do NOT alter the frontmatter `name`/`description` (drift check is generated from those).

**Acceptance criteria:**
- The walkthrough's work-item-close example uses a `{7hex}` ID, not `WI-auth-001`
- A close-domain one-shot alternative to steps 4–6 is presented
- `node plugin/scripts/check-skills-drift.js` still exits 0 (sdd-help enumeration unchanged)

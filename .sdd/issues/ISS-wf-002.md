---
id: ISS-wf-002
domain: workflow
status: open
location: "plugin/skills/gap-to-work-items/SKILL.md"
severity: medium
discovered: "2026-06-27T23:04:26Z"
reviewed-by: null
---

# Issue: Sequence-number assignment ignores archive/, recycling IDs

**Location:** `plugin/skills/gap-to-work-items/SKILL.md` (step 1 + step 3); same pattern in `plugin/skills/review-engage/SKILL.md` and `plugin/skills/spec-audit/SKILL.md`
**Problem:** Work-item/gap IDs are assigned using "the next available sequence number for the domain" computed by scanning only the **active** `.sdd/work-items/WI-{abbrev}-*.md` (or `.sdd/gaps/`) files; the skills never consult the `archive/` subdirectory.
**Rationale:** On any repo with archived history (this one has `WI-arch-001..037` and `GAP-arch-001..040` archived), the skills recycle IDs — observed live when `gap-to-work-items` assigned the already-used `WI-arch-001` and a manual engage assigned `GAP-arch-001/002`. This violates the gap/work-item invariant that IDs are "globally stable within the domain" and "never recycled," and breaks provenance/orphan detection. Fix: compute the next sequence across both active and `archive/` files.
**Severity:** medium

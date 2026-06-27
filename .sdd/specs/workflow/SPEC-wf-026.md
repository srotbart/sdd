---
id: SPEC-wf-026
domain: workflow
abbrev: wf
status: active
aliases: []
version: "a743560e"
---

# SPEC-wf-026 — Improvements are a team-produced enhancement artifact type

## Invariant

SDD includes an **improvements** artifact type, the enhancement-focused sibling of issues (SPEC-wf-025). An SDD skill spawns exactly 3 agents via the Agent tool focused on improvements — enhancements, refactors, simplifications, performance, ergonomics, better patterns — rather than defects. Each proposal is written as an improvement artifact under `.sdd/improvements/` (`IMP-{domain}-{seq}`, with an `archive/` subdirectory) recording what to improve, where, the expected benefit, and a rough effort/impact estimate. The artifact mechanics (storage, ID convention, de-duplication, archival) are shared with the issues artifact; only the intent differs.

## Acceptance criteria

- An SDD skill spawns a 3-agent improvements team via the Agent tool (not `TeamCreate`)
- The team focuses on enhancements/refactors/simplifications, not defects
- Each proposal is stored as `IMP-{domain}-{seq}` under `.sdd/improvements/` (with an `archive/` subdirectory)
- An improvement artifact records: what to improve, where, expected benefit, and an effort/impact estimate
- Proposals are de-duplicated across the three agents into distinct artifacts
- Issues and improvements share the same artifact mechanics, differing only in intent

**Tests:**
- `plugin/skills/review-improvements/SKILL.md` spawns 3 agents via the Agent tool, not `TeamCreate` — "review-improvements uses the Agent tool to spawn 3 agents"
- `.sdd/improvements/` directory exists — "improvements artifact storage location is scaffolded"
- `.sdd/improvements/archive/` directory exists — "improvements archive storage location is scaffolded"

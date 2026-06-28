---
id: SPEC-wf-026
domain: workflow
abbrev: wf
status: active
aliases: []
version: "ede02159"
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
- `hub/server/spec-wf-plugin.test.ts::SPEC-wf-026: Improvements are a team-produced enhancement artifact type > SPEC-wf-026: review-improvements spawns exactly 3 agents via the Agent tool` — "3 agents spawned via the Agent tool"
- `hub/server/spec-wf-plugin.test.ts::SPEC-wf-026: Improvements are a team-produced enhancement artifact type > SPEC-wf-026: review-improvements does not spawn via the removed TeamCreate tool` — "no TeamCreate invocation"
- `hub/server/spec-wf-plugin.test.ts::SPEC-wf-026: Improvements are a team-produced enhancement artifact type > SPEC-wf-026: proposals are IMP-{domain}-{seq} under .sdd/improvements/ recording effort and impact` — "improvement artifact shape"
- `hub/server/spec-wf-plugin.test.ts::SPEC-wf-026: Improvements are a team-produced enhancement artifact type > SPEC-wf-026: the team never auto-applies improvements` — "never auto-applies"
- `hub/server/spec-wf-plugin.test.ts::SPEC-wf-026: Improvements are a team-produced enhancement artifact type > SPEC-wf-026: improvements storage and archive directories are scaffolded` — "improvements storage + archive scaffolded"

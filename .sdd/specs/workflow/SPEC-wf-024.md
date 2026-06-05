---
id: SPEC-wf-024
domain: workflow
abbrev: wf
status: active
aliases: []
version: "8e957399"
---

# SPEC-wf-024 — Improvements are a team-produced enhancement artifact type

## Invariant

SDD includes an **improvements** artifact type, the enhancement-focused sibling of issues (SPEC-wf-023). An SDD skill spawns a team of exactly 3 agents via `TeamCreate` focused on improvements — enhancements, refactors, simplifications, performance, ergonomics, and better patterns — rather than defects. Each proposal is written as an improvement artifact under `.sdd/improvements/` (`IMP-{domain}-{seq}`) recording what to improve, where, and the expected benefit. The artifact mechanics (storage, ID convention, de-duplication, archival) are shared with the issues artifact; only the intent differs.

## Acceptance criteria

- An SDD skill spawns a 3-agent improvements team via `TeamCreate`
- The team focuses on enhancements/refactors/simplifications, not defects
- Each proposal is stored as an `IMP-{domain}-{seq}` artifact under `.sdd/improvements/` (with an `archive/` subdirectory)
- An improvement artifact records at least: what to improve, where, and the expected benefit
- Proposals are de-duplicated across the three agents into distinct artifacts
- Issues and improvements share the same artifact mechanics, differing only in intent

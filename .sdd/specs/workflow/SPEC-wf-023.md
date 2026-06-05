---
id: SPEC-wf-023
domain: workflow
abbrev: wf
status: active
aliases: []
version: "555e2387"
---

# SPEC-wf-023 — Issues are a reviewer-team-produced artifact type

## Invariant

SDD includes an **issues** artifact type produced by a dedicated reviewer team. An SDD skill spawns a team of exactly 3 agents via `TeamCreate` whose sole purpose is to sweep the codebase and the specs and flag potential problems — code correctness bugs, styling, anti-patterns, code smells, bad practices, and issues with the specs themselves. Each distinct finding is written as an issue artifact under `.sdd/issues/` (`ISS-{domain}-{seq}`) recording where it is, what is wrong, and why. The three reviewers divide the work and their findings are de-duplicated into distinct artifacts. Issues are never auto-fixed by the reviewer team.

## Acceptance criteria

- An SDD skill spawns a 3-agent reviewer team via `TeamCreate`
- Reviewers flag findings across code (bugs, styling, anti-patterns, smells, bad practices) and specs
- Each finding is stored as an `ISS-{domain}-{seq}` artifact under `.sdd/issues/` (with an `archive/` subdirectory)
- An issue artifact records at least: location, a description of the problem, and the rationale
- Findings are de-duplicated across the three reviewers into distinct artifacts
- The reviewer team does not auto-fix the issues it finds

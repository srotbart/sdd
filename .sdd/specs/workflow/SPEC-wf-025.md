---
id: SPEC-wf-025
domain: workflow
abbrev: wf
status: active
aliases: []
version: "e785b833"
---

# SPEC-wf-025 — Issues are a reviewer-team-produced artifact type

## Invariant

SDD includes an **issues** artifact type produced by a dedicated reviewer team. An SDD skill spawns exactly 3 agents via the Agent tool whose sole purpose is to sweep the codebase and the specs and flag potential problems — code correctness bugs, styling, anti-patterns, code smells, bad practices, and issues with the specs themselves. Each distinct finding is written as an issue artifact under `.sdd/issues/` (`ISS-{domain}-{seq}`, with an `archive/` subdirectory) recording its location, the problem, the rationale, and a severity (`low` | `medium` | `high`). The three reviewers divide the work and their findings are de-duplicated into distinct artifacts. The reviewer team never auto-fixes the issues it finds.

## Acceptance criteria

- An SDD skill spawns a 3-agent reviewer team via the Agent tool (not `TeamCreate`)
- Reviewers flag findings across code (bugs, styling, anti-patterns, smells, bad practices) and specs
- Each finding is stored as `ISS-{domain}-{seq}` under `.sdd/issues/` (with an `archive/` subdirectory)
- An issue artifact records: location, problem description, rationale, and a `low`/`medium`/`high` severity
- Findings are de-duplicated across the three reviewers into distinct artifacts
- The reviewer team does not auto-fix the issues it finds

**Tests:**
- `hub/server/spec-wf-plugin.test.ts::SPEC-wf-025: Issues are a reviewer-team-produced artifact type > SPEC-wf-025: review-issues spawns exactly 3 reviewer agents via the Agent tool` — "3 reviewers spawned via the Agent tool"
- `hub/server/spec-wf-plugin.test.ts::SPEC-wf-025: Issues are a reviewer-team-produced artifact type > SPEC-wf-025: review-issues does not spawn via the removed TeamCreate tool` — "no TeamCreate invocation"
- `hub/server/spec-wf-plugin.test.ts::SPEC-wf-025: Issues are a reviewer-team-produced artifact type > SPEC-wf-025: findings are ISS-{domain}-{seq} under .sdd/issues/ recording location, problem, rationale, severity` — "issue artifact shape"
- `hub/server/spec-wf-plugin.test.ts::SPEC-wf-025: Issues are a reviewer-team-produced artifact type > SPEC-wf-025: reviewers never auto-fix findings` — "reviewers never auto-fix"
- `hub/server/spec-wf-plugin.test.ts::SPEC-wf-025: Issues are a reviewer-team-produced artifact type > SPEC-wf-025: issues storage and archive directories are scaffolded` — "issues storage + archive scaffolded"

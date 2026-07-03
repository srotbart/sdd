---
id: SPEC-wf-036
domain: workflow
abbrev: wf
status: active
aliases: []
version: "8270d2c2"
---

# SPEC-wf-036 — Terminal artifact state is committed before archiving

## Invariant

Every skill that archives an artifact (work-item-close, target-engage, review-engage) commits the artifact's terminal state — status flip, provenance fields such as `closed-by`, final dialog entry — **before** moving the file into `archive/`. Because the archive copy is untracked (SPEC-wf-035), the move itself appears to git as a plain deletion; the prior commit therefore guarantees that git history retains the complete final content of every artifact that reaches a terminal state. Recovery of an archived artifact, when ever needed, is manual: `git log --diff-filter=A -- <path>` to locate it and `git show <sha>:<path>` to read it. This guarantee holds for merged work under a merge-commit strategy; squash-merging or rebasing artifact commits away would erase artifacts created and closed within a single branch.

## Acceptance criteria

- Each archiving skill's closing procedure states the ordering explicitly: write terminal state → commit → `mv` to `archive/`
- The terminal state (status, provenance fields, final dialog) is present in the last committed version of every archived artifact
- No skill instructs staging or committing files under ephemeral `archive/` paths
- The merge-strategy caveat (merge commits, no squash) is documented in the artifact operating guides

**Tests:**
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-036: Terminal artifact state is committed before archiving > SPEC-wf-036: work-item-close states the commit-before-mv ordering (terminal state → commit → mv)` — work-item-close commits terminal state before archiving
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-036: Terminal artifact state is committed before archiving > SPEC-wf-036: target-engage states the commit-before-mv ordering (terminal state → commit → mv)` — target-engage commits terminal state before archiving
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-036: Terminal artifact state is committed before archiving > SPEC-wf-036: review-engage states the commit-before-mv ordering (terminal state → commit → mv)` — review-engage commits terminal state before archiving
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-036: Terminal artifact state is committed before archiving > SPEC-wf-036: work-item-close forbids staging files under an archive path` — work-item-close never stages ephemeral archive files
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-036: Terminal artifact state is committed before archiving > SPEC-wf-036: target-engage forbids staging files under an archive path` — target-engage never stages ephemeral archive files
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-036: Terminal artifact state is committed before archiving > SPEC-wf-036: review-engage forbids staging files under an archive path` — review-engage never stages ephemeral archive files
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-036: Terminal artifact state is committed before archiving > SPEC-wf-036: the merge-strategy caveat is documented in the artifact operating guides` — the no-squash merge caveat is documented in the work-item and target guides

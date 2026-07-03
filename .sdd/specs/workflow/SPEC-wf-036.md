---
id: SPEC-wf-036
domain: workflow
abbrev: wf
status: active
aliases: []
version: "ed829ea2"
---

# SPEC-wf-036 — Terminal artifact state is committed before archiving

## Invariant

Every skill that archives an artifact (work-item-close, target-engage, review-engage) commits the artifact's terminal state — status flip, provenance fields such as `closed-by`, final dialog entry — **before** moving the file into `archive/`. Because the archive copy is untracked (SPEC-wf-035), the move itself appears to git as a plain deletion; the prior commit therefore guarantees that git history retains the complete final content of every artifact that reaches a terminal state. Recovery of an archived artifact, when ever needed, is manual: `git log --diff-filter=A -- <path>` to locate it and `git show <sha>:<path>` to read it. This guarantee holds for merged work under a merge-commit strategy; squash-merging or rebasing artifact commits away would erase artifacts created and closed within a single branch.

## Acceptance criteria

- Each archiving skill's closing procedure states the ordering explicitly: write terminal state → commit → `mv` to `archive/`
- The terminal state (status, provenance fields, final dialog) is present in the last committed version of every archived artifact
- No skill instructs staging or committing files under ephemeral `archive/` paths
- The merge-strategy caveat (merge commits, no squash) is documented in the artifact operating guides

---
id: SPEC-wf-040
domain: workflow
abbrev: wf
status: active
aliases: []
version: "b6d12aa5"
---

# SPEC-wf-040 — Work items are closed with cross-domain spec context and self-check

## Invariant

Before implementing a work item inside `sdd:close-domain`, the worker selects the spec items relevant to the code the work item will touch — from ALL domains, using the spec index plus `scope:` globs (SPEC-wf-042) — and loads their full text into context. When the index is inconclusive (unfamiliar area, large blast radius), a read-only spec-discovery subagent sweeps the corpus and returns the governing items; if the subagent is unavailable, the worker falls back to index-plus-reasoning and says so in its report — discovery is never silently skipped. Before a work item is marked done: (a) the gap's spec item acceptance criteria are each verified against the code — "tests pass" alone is not completion — and (b) the diff is self-checked against every selected cross-domain spec item.

## Acceptance criteria

- `sdd:close-domain` instructs selecting relevant spec items across all domains before implementing each work item
- Discovery uses the index and scope globs first; a read-only subagent only when inconclusive; fallback is reported, never silent
- `sdd:work-item-close` verifies each acceptance criterion of the gap's spec item against the code before marking done
- The diff is self-checked against the selected cross-domain spec items before the work item is marked done

**Tests:**
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-040: work items are closed with cross-domain spec context and self-check > SPEC-wf-040: work-item-close verifies each acceptance criterion against the code before done` — acceptance criteria are verified against code, not just tests
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-040: work items are closed with cross-domain spec context and self-check > SPEC-wf-040: work-item-close instructs a cross-domain diff self-check from close-domain` — the diff is self-checked against provided cross-domain spec items
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-040: work items are closed with cross-domain spec context and self-check > SPEC-wf-040: close-domain selects relevant spec items across all domains before implementing` — close-domain selects governing items across all domains before each work item

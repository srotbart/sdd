---
id: GAP-wf-04d61f5
spec-item: SPEC-wf-006
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "d263cdd8"
closed-by: WI-wf-a8fe84b
deferred-reason: null
---

# Gap: worker prompt does not use the identity / one-imperative / standing-rules shape

**Location:** `plugin/skills/spawn-sdd-worker/SKILL.md:56`
**Reasoning:** Amended SPEC-wf-006 requires the prompt to spend its authority on exactly three non-procedural elements — identity, one imperative (first action = `sdd:close-domain {domain}`, no other procedure), and standing rules including surfacing any lead-instruction-vs-spec conflict by quoting the item instead of complying; the current prompt carries embedded procedural steps and has no conflict-surfacing rule.

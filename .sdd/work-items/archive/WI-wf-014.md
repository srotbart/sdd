---
id: WI-wf-014
gap-id: GAP-wf-014
domain: workflow
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add "Next:" prefix to all pipeline skill footer examples

**Scope:** `plugin/skills/spec-audit/SKILL.md`, `plugin/skills/gap-to-work-items/SKILL.md`, `plugin/skills/work-item-close/SKILL.md`, `plugin/skills/spec-test/SKILL.md`, `plugin/skills/session-start/SKILL.md`, `plugin/skills/spawn-sdd-worker/SKILL.md` — update the footer example in each skill's output section to use `Next: {sentence}. Run \`/{command} {arg}\` to proceed.` format after a `---` divider; update spawn-sdd-worker footer wording to exactly `Worker running. You will be notified on completion.`

**Acceptance criteria:**
- Each pipeline skill SKILL.md footer example starts with `Next:` after the `---` divider
- `spawn-sdd-worker` footer says exactly "Worker running. You will be notified on completion."
- `work-item-close` footer is conditional: next WI id when items remain, or "Run `/sdd:spec-audit {domain}` to verify" when all closed
- Test: grep confirms `Next:` appears in footer section of each updated skill file
- Test: grep confirms spawn-sdd-worker contains the exact spec-required footer text

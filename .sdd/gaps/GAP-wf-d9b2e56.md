---
id: GAP-wf-d9b2e56
spec-item: SPEC-wf-037
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "6c6b60f8"
closed-by: WI-wf-7e1d4b9
deferred-reason: null
---

# Gap: Artifact guides still document sequential ID minting with archive scan

**Locations:**
- `plugin/references/artifacts/gap.md:12` (Schema: `GAP-{abbrev}-{seq}` in file path and ID pattern)
- `plugin/references/artifacts/gap.md:94` (Operating Procedure step 4: "Assign the next sequential ID... Compute {next-seq} from the max across both .sdd/gaps/ and .sdd/gaps/archive/")
- `plugin/references/artifacts/work-item.md:12` (Schema: `WI-{abbrev}-{seq}` in file path and ID pattern)
- `plugin/references/artifacts/work-item.md:15` (Schema: "number from the max across both .sdd/work-items/ and .sdd/work-items/archive/")

**Reasoning:** The gap and work-item artifact guides still instruct sequential ID minting with an archive scan, contradicting SPEC-wf-037's requirement that ephemeral artifacts mint `{7hex}` hash IDs with no sequence scan; the minting skills (spec-audit, gap-to-work-items) were updated but the authoritative guides were not.

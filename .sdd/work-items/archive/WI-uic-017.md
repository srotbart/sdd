---
id: WI-uic-017
gap-id: GAP-uic-014
domain: ui-components
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Filter empty-string values from ArtifactList tab derivation

**Scope:** `hub/client/src/components/ArtifactList.tsx:29` — add `.filter(v => v !== '')` after building `allValues` from the Set so empty-string field values do not generate a tab button.

**Acceptance criteria:**
- `allValues` excludes empty strings before the `tabs` array is constructed
- An item with an empty-string `filterKey` value still appears under the "all" tab
- No tab button with an empty label is rendered when some items have an empty `filterKey` value
- Unit test: items with empty domain string do not produce a blank filter tab
- Unit test: items with empty domain still appear when "all" tab is active

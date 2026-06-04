---
id: GAP-ui-024
spec-item: SPEC-ui-021
domain: ui-layout
status: closed
discovered: "2026-06-04T00:00:00Z"
audit-spec-version: "dc0d85ff"
closed-by: WI-ui-024
deferred-reason: null
---

# Gap: Component CSS uses hardcoded colour literals where tokens exist or are needed for dark-mode legibility

**Locations:**
- `hub/client/src/screens/Specs.css:371`
- `hub/client/src/screens/Specs.css:372`
- `hub/client/src/screens/Specs.css:373`
- `hub/client/src/screens/Specs.css:374`
- `hub/client/src/screens/Specs.css:375`
- `hub/client/src/screens/Gaps.css:331`
- `hub/client/src/screens/Gaps.css:332`
- `hub/client/src/screens/Gaps.css:333`
- `hub/client/src/screens/Gaps.css:335`
- `hub/client/src/components/AgentChip.css:21`
- `hub/client/src/components/AgentChip.css:22`
- `hub/client/src/components/AgentChip.css:23`
- `hub/client/src/components/AgentChip.css:24`
- `hub/client/src/components/AgentChip.css:25`
- `hub/client/src/components/AgentChip.css:26`

**Reasoning:** Coverage dots (Specs.css), syntax-highlight colours (Gaps.css), and agent-chip avatar backgrounds (AgentChip.css) all use raw hex literals that will remain fixed in dark mode; they must reference or be superseded by tokens so the dark token set can keep status indicators and accent colours legible on dark surfaces.

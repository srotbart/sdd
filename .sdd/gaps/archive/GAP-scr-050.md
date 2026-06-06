---
id: GAP-scr-050
spec-item: SPEC-scr-053
domain: ui-screens
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "b3d1df5b"
closed-by: WI-scr-053
deferred-reason: null
---

# Gap: Projection view text-select + comment feature is not implemented

**Locations:**
- `hub/client/src/screens/Projections.tsx` — no text-selection detection, no comment marker icon, no action menu, no comment highlight overlay
- `hub/client/src/screens/Projections.css` — no comment highlight or tooltip styles
- `hub/client/src/screens/` — no test coverage for SPEC-scr-053 behaviour

**Reasoning:** SPEC-scr-053 requires that selecting text in a rendered projection reveals a marker icon, clicking it opens a clarify/re-evaluate/expand/condense menu with a note field, confirming persists via the comments API (SPEC-arch-042), and commented text renders highlighted with a type label and hover tooltip. None of this exists in the current Projections screen.

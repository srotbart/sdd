---
domain: all
created: 2026-05-28T00:00:00Z
status: applied
---

# Spec Collapse Proposal — All Domains — 2026-05-28

---

## Proposed merges

### Merge SPEC-scr-025 + SPEC-scr-026 + SPEC-scr-036 → SPEC-scr-025

**Evidence:** All three items assert the same underlying requirement — Targets.tsx and Gaps.tsx use the shared `ArtifactList` component correctly. SPEC-scr-025 and SPEC-scr-026 were written when the mandate was simply "use the component"; SPEC-scr-036 was added later when the filterKey API was introduced, superseding the earlier two. No audit has ever produced a gap against scr-025 for Targets while scr-026 held for Gaps independently — the two screens have always been in the same state. GAP-scr-023 (cited scr-025) and GAP-scr-033 (cited scr-036) address violations of the same requirement from different angles.

**Proposed unified statement (SPEC-scr-025):**

> `Targets.tsx` and `Gaps.tsx` render active and archived rows via `ArtifactList` with no inline reimplementation. `Targets.tsx` passes all targets (unfiltered) with `filterKey="status"`, `archivedValues={['accepted','archived']}`, and `filterLabels` for human-readable tab names. `Gaps.tsx` passes all gaps with `filterKey="domain"`, `archivedKey="status"`, `archivedValues={['closed','deferred','accepted']}`. No inline filter state, manual active/archived split, or filter bar JSX is permitted in either screen; those responsibilities belong exclusively to `ArtifactList`.

**Aliases:**
- SPEC-scr-026 becomes an alias of SPEC-scr-025.
- SPEC-scr-036 becomes an alias of SPEC-scr-025.

Existing gaps referencing SPEC-scr-026 or SPEC-scr-036 remain valid via alias resolution.

**To apply:**
1. Replace the SPEC-scr-025 item body with the unified statement above.
2. Add `Aliases: SPEC-scr-026, SPEC-scr-036` to its `*Status:*` line.
3. Delete the `## SPEC-scr-026` and `## SPEC-scr-036` headings and their bodies.
4. Recompute the spec version hash: `shasum -a 256 .sdd/specs/SPEC-ui-screens.md | cut -c1-8` and update the frontmatter `version` field.

---

### Merge SPEC-scr-035 + SPEC-scr-037 → SPEC-scr-035

**Evidence:** Both items assert the same invariant — `ws.counts.*` fields must be accessed with optional chaining and a numeric fallback — in two adjacent files (App.tsx and Dashboard.tsx). They were added in the same session as a response to the same root cause (startup-race crash when `counts` is absent on a WebSocket workspace). GAP-scr-034 (cited scr-037 for Dashboard.tsx) was the only gap ever produced against this requirement; App.tsx happened to already be guarded. Separate spec items for "same pattern, different file" produce unnecessary audit overhead without improving traceability.

**Proposed unified statement (SPEC-scr-035):**

> Every access to a `counts` field on a workspace object in `App.tsx` and `Dashboard.tsx` — including inside `computeTotals`, JSX, and any helper that receives a workspace — uses optional chaining with a numeric fallback: `ws.counts?.field ?? 0`. No direct `ws.counts.field` dereference is permitted in either file. This prevents a runtime crash when a workspace delivered via WebSocket snapshot or update lacks a `counts` field during startup, partial hydration, or in test fixtures. The `App.test.tsx` snapshot fixture must include a complete `counts: WorkspaceCounts` object on mock workspaces.

**Alias:**
- SPEC-scr-037 becomes an alias of SPEC-scr-035.

**To apply:**
1. Replace the SPEC-scr-035 item body with the unified statement above.
2. Add `Aliases: SPEC-scr-037` to its `*Status:*` line.
3. Delete the `## SPEC-scr-037` heading and its body.
4. Recompute the spec version hash and update the frontmatter `version` field.

---

### Merge SPEC-scr-009 + SPEC-scr-020 + SPEC-scr-021 + SPEC-scr-028 + SPEC-scr-029 + SPEC-scr-033 → one new item SPEC-scr-009 (note: reword only)

*This merge is weaker — offered for consideration, not strongly recommended.*

**Evidence:** Six items all assert "App.tsx fetches live data for [screen] instead of using mock constants." All were introduced together when mock data was replaced. Each targets a different endpoint, but the pattern is identical: fetch on workspace-change, re-fetch on `sdd-changed`, pass result to screen, remove MOCK_* constant. GAP-scr-009 (mocks not replaced) generated 2 gaps, scr-020 generated 2 gaps — always about the same migration pattern. Auditing them separately adds overhead when the real risk is a single regression ("App.tsx reverts to mocks").

**Risk of merging:** A single item would obscure which endpoint has regressed. If only `/targets` fetching breaks, a single item makes the gap less actionable.

**Recommendation:** Instead of merging, **reword** each item to include an explicit `sdd-changed` re-fetch clause, since several items currently omit this detail. Keep items separate. No structural change needed.

---

## Proposed splits

### Split SPEC-scr-020: separate data-fetch from archived-section display

**Evidence:** SPEC-scr-020 conflates two independent invariants: (1) `App.tsx` fetches `GET /workspaces/:id/gaps` on workspace change; (2) the Gaps list renders an archived section with specific eyebrow divider styling. The first is a data layer concern (testable server-side); the second is a UI concern (testable by visual inspection). GAP-scr-020 and GAP-scr-025 (two gaps cited scr-020) addressed both halves independently. The archived-section display detail (`letter-spacing: 0.18em`, ▾/▸ toggle, opacity) is already specified in SPEC-scr-015 for Targets — the cross-reference in scr-020 creates a redundant specification.

**Proposed item A (retain SPEC-scr-020 — data fetch):**
> `App.tsx` fetches `GET /workspaces/:id/gaps` when the active workspace ID changes and re-fetches when a `sdd-changed` WebSocket event with `artifact: "gaps"` arrives. The result is passed to the `Gaps` component, replacing any mock data. The fetch result is stored in `liveGaps` state.

**Proposed item B (new — refer to SPEC-scr-020b):**
> The Gaps screen left list splits gaps into active (`open`) and archived (`closed`, `deferred`, `accepted`) sections using the shared `ArtifactList` component (SPEC-uic-001). The domain filter applies to both sections. Active gaps appear first; archived gaps appear in the collapsible archived section.

*Note: most of item B is already expressed by SPEC-scr-026 (now merged into SPEC-scr-025 above) — consider whether item B is needed at all after that merge.*

**To apply:**
1. Narrow the SPEC-scr-020 statement to data-fetch only.
2. Evaluate whether the display invariant is fully captured by SPEC-scr-025 (merged) before adding item B.
3. If item B is needed, assign it the next available sequence number in ui-screens.
4. Recompute spec version hash.

---

## No action recommended

**SPEC-arch-025 + SPEC-arch-038:** Related (both about WebSocket message types) but auditing them separately is valuable. SPEC-arch-025 covers the wire shape; SPEC-arch-038 covers the TypeScript union type. A code change could break one without breaking the other (e.g., correct JSON shape but union type not updated). GAP-arch-021 (025) and GAP-arch-033 (038) address different code locations. Keep separate.

**SPEC-arch-030 + SPEC-arch-036:** REST and WebSocket are genuinely different delivery channels with different code paths. GAP-arch-026 (030) and GAP-arch-031 (036) fix different functions. Keep separate.

**SPEC-uic-001 + SPEC-uic-009 + SPEC-uic-010:** All three specify `ArtifactList`, but each generated an independent gap at a distinct location. uic-001 covers the component's basic contract; uic-009 covers the filtering pipeline (a distinct feature added later); uic-010 covers a specific edge case in tab derivation. The three items have never been confused for each other in gap reports. Keep separate.

**SPEC-arch-010/013/014/015/016/039** (individual REST endpoint items): Each governs a distinct handler with a unique URL pattern, field contract, and error behavior. They're verbose but auditable independently. No consolidation warranted.

**SPEC-scr-001 through SPEC-scr-008** (screen existence items): These have never generated gaps — the screens always exist. They serve as an audit anchor ("does the screen exist at all?") rather than implementation guards. Consider whether they add value as the codebase matures; for now, keep.

---

## Summary

| Action | Items | Notes |
|---|---|---|
| Merge | SPEC-scr-025 + SPEC-scr-026 + SPEC-scr-036 | Strongly recommended |
| Merge | SPEC-scr-035 + SPEC-scr-037 | Recommended |
| Reword only | SPEC-scr-009/020/021/028/029/033 | Add sdd-changed clause where missing |
| Split | SPEC-scr-020 | Optional — evaluate after SPEC-scr-025 merge |
| No change | All architecture items | All distinct |
| No change | SPEC-uic-001/009/010 | All distinct despite same component |
| No change | SPEC-scr-001–008 | Low value but harmless |

Apply the two strong merges first; re-evaluate the SPEC-scr-020 split afterward.

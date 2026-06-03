---
id: SPEC-scr-003
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "dceb2d2d"
---

# SPEC-scr-003 — Workspace Targets screen

`client/src/screens/Targets.tsx` has a full-width title bar above the two-pane split: `▪ targets — declared intent, negotiated to spec` (small square bullet, "targets" in Newsreader italic, muted subtitle text) with a `+ new target` button (filled black, top-right). The left list (~380 px) has a filter bar with tabs: all / awaiting you / awaiting agent / ready / draft / archived, each with a live count. Active items appear first; below them a `· ARCHIVED N` eyebrow divider separates archived items — each archived row shows the standard fields (ID in mono accent, status pill, time-ago, title in serif, domain in brackets, dialog-turn count) plus a `folded → SPEC-{abbrev}-{seq}` footer in muted mono when accepted into a spec item. The selected row has a 2 px accent left border. The right pane shows target detail: header with ID + status + domain + created + title, a current-statement block with a left accent border bar and an edit toggle, a turn-by-turn dialog log (YOU / AGENT labels, dated, bordered-left), and a sticky composer at the bottom.

**Tests:**
- `hub/client/src/screens/Targets.test.tsx > Targets title bar > renders the title bar above the two-pane layout` — "Targets renders title bar above the two-pane split"
- `hub/client/src/screens/Targets.test.tsx > Targets title bar > title bar contains the bullet, italic word, and subtitle` — "Title bar contains ▪ bullet, italic 'targets', and subtitle text"
- `hub/client/src/screens/Targets.test.tsx > Targets title bar > title bar contains the + new target button` — "+ new target button is present in the title bar"

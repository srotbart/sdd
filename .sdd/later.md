# Later — deferred thoughts

## Design phase (resolved in TGT-085)

- Design docs live at `.sdd/design/<name>/design.md`, optional sibling files in same dir
- Design phase is optional — small changes go straight to targets
- `sdd:session-start` should surface open designs (designs with no targets spawned yet) — not yet implemented
- Should targets carry a `design:` frontmatter reference back to the doc that spawned them? — not decided yet
- Feature-as-projection (cross-cutting problem): spec items that span multiple user-facing capabilities don't cleanly belong to one feature tag. Domain axis ≠ capability axis. Deferred — revisit separately.
- Targets could later carry additional data in a directory structure (like spec subject subdirs) — out of scope for now

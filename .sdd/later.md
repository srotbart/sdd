# Later — deferred thoughts

## Design phase (resolved in TGT-085)

- Design docs live at `.sdd/design/<name>/design.md`, optional sibling files in same dir
- Design phase is optional — small changes go straight to targets
- `sdd:session-start` should surface open designs (designs with no targets spawned yet) — shipped: the "Designs in progress" section
- Should targets carry a `design:` frontmatter reference back to the doc that spawned them? — decided yes: `design:` is documented in the target guide and read by the artifact CLI (`list targets --json`)
- Feature-as-projection (cross-cutting problem): spec items that span multiple user-facing capabilities don't cleanly belong to one feature tag. Domain axis ≠ capability axis. Deferred — revisit separately.
- Targets could later carry additional data in a directory structure (like spec subject subdirs) — out of scope for now

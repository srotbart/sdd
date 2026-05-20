# Example: Stale Audit, No Active Targets

The spec has been updated since the last audit ran. No targets are in flight.
The primary call to action is refreshing the gap report.

## Output

```
## SDD State — 2026-05-12

### Specs (2 domains)
- SPEC-auth: Authentication — 4 items  [c4e1f205]
- SPEC-api: API — 6 items  [b7d2e941]

⚠ Stale audits: authentication (gaps at a3f9c812, spec now c4e1f205)

### Open gaps (2)
- GAP-api-001: Rate limit not applied to /search  [SPEC-api-003]
- GAP-api-002: Rate limit bypass via OPTIONS  [SPEC-api-003]

### Active work items
- WI-api-001: Apply rate limiting to /search  [pending]

---
Run `/sdd:spec-audit authentication` to refresh the gap report before closing work items.
```

## Notes

- Authentication gaps are stale but still shown — they are still open.
- The footer prioritises the stale audit warning over the pending work item.
- API domain is not stale (b7d2e941 matches what the API gaps recorded).

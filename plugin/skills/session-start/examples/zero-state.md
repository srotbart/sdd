# Example: Zero State

No `.sdd/` directory exists. The project has not started SDD yet.

## Output

```
No .sdd/ directory found. This project has no SDD state yet.

To begin:
  mkdir -p .sdd/{targets,specs,gaps,work-items}
  mkdir -p .sdd/{targets,gaps,work-items}/archive

Then write the first target at .sdd/targets/TGT-001.md and run
/sdd:target-engage to negotiate it.
```

## Notes

- No sections are printed — there is nothing to report.
- The zero-state message includes the exact commands to bootstrap the directory structure.
- Session-start exits immediately after printing this message.

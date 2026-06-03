---
id: WI-arch-020
gap-id: [GAP-arch-002, GAP-arch-003, GAP-arch-004, GAP-arch-005]
domain: architecture
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement test report parsers and test status computation

**Scope:** `hub/server/sdd-parser.ts` — add functions to read `SPEC-{abbrev}.tests.json` mapping files, parse Vitest JSON reports (walking `testResults[*].assertionResults`), parse Maven Surefire XML reports (reading `TEST-*.xml` files), and compute four-state test status (not-run / missing / failing / passing) per spec item.

**Acceptance criteria:**
- `readTestMapping(sddPath, abbrev)` reads and parses `SPEC-{abbrev}.tests.json`; returns null if absent
- `parseVitestReport(reportPath)` walks `testResults[*].assertionResults`, returns `{ tests: {fullName, status}[], runAt: string } | null`
- `parseSurefireReports(dir)` reads all `TEST-*.xml`, extracts `<testcase classname name timestamp>`, returns `{ tests: {fullName, status}[], runAt: string } | null`
- `computeTestStatus(item, mapping, parsedReport)` returns `{ status: "not-run" | "missing" | "failing" | "passing", lastRun?: string }` following SPEC-arch-022 precedence rules
- Unit tests cover each of the four status states and both report parsers

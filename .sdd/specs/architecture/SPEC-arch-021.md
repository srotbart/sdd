---
id: SPEC-arch-021
domain: architecture
abbrev: arch
status: active
aliases: []
version: "55349f9f"
---

# SPEC-arch-021 — Maven Surefire XML reports are parsed from all TEST-*.xml files in the declared directory

When `runner` is `"maven"`, `report` points to a directory (e.g., `target/surefire-reports/`). The server reads all `TEST-*.xml` files in that directory. Each `<testcase>` element is one result; `fullName` is `classname + " " + name`. A `<failure>` or `<error>` child element marks the test as failed; otherwise it is passed. The `timestamp` attribute of the enclosing `<testsuite>` element is the run timestamp. If the directory does not exist or contains no XML files, the parser returns `null`.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-021: Surefire XML report parsing > SPEC-arch-021: reads all TEST-*.xml, builds fullName from classname+name, flags <failure> as failed — "Surefire XML is parsed from TEST-*.xml with failures detected"
hub/server/spec-arch.test.ts > SPEC-arch-021: Surefire XML report parsing > SPEC-arch-021: returns null when the directory has no TEST-*.xml files — "an empty report directory yields null"

---
id: SPEC-arch-021
domain: architecture
abbrev: arch
status: active
aliases: []
version: "b64b75d9"
---

# SPEC-arch-021 — Maven Surefire XML reports are parsed from all TEST-*.xml files in the declared directory

When `runner` is `"maven"`, `report` points to a directory (e.g., `target/surefire-reports/`). The server reads all `TEST-*.xml` files in that directory. Each `<testcase>` element is one result; `fullName` is `classname + " " + name`. A `<failure>` or `<error>` child element marks the test as failed; otherwise it is passed. The `timestamp` attribute of the enclosing `<testsuite>` element is the run timestamp. If the directory does not exist or contains no XML files, the parser returns `null`.

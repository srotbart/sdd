---
name: spec-test
description: This skill should be used when the user invokes `/sdd:spec-test`, says "write tests for the spec", "add spec tests for authentication", "cover SPEC-auth-001 with a test", "generate integration tests for the spec", "which spec items have no tests", or wants to add automated test coverage to spec items. Generates integration or e2e tests in the project's existing test infrastructure, then links them back into the spec item.
version: 0.1.0
---

# SDD Spec Test

For each target spec item, generate an integration or e2e test that verifies the
invariant holds in the codebase, then write a `**Tests:**` link back into the spec
item describing exactly what behavior each test exercises. The spec becomes the
index of its own verification.

Tests live in the project's existing test directory — not in `.sdd/`. They run
with the normal CI pipeline.

## Input

Accept one of:

- **Spec item ID**: `SPEC-auth-001` — generate tests for a single item
- **Domain name**: `authentication` — generate tests for all items in the domain that lack coverage
- **No argument**: report coverage status for all domains, then ask which to cover

## Procedure

### 1. Identify uncovered spec items

Glob `.sdd/specs/{domain}/SPEC-*.md` and `.sdd/specs/{domain}/*/SPEC-*.md` (skip `archive/` at either level) for each domain being targeted.
For each active spec item file, check whether a `**Tests:**` block exists in the body.
Items without it are uncovered. Report the list before proceeding.

If all items are covered, report that and stop — ask the user whether to update
an existing test or add additional coverage.

### 2. Understand the project's test infrastructure

Before writing any tests, explore the codebase to understand:

- Test framework (pytest, Jest, Go testing, JUnit, etc.)
- Test directory structure and naming conventions
- Where integration/e2e tests live vs. unit tests (look for a `tests/integration/`,
  `tests/e2e/`, `spec/`, or equivalent)
- How the test subject is initialized (fixtures, factories, test clients)
- Any existing patterns for testing at the boundary (HTTP client, service call, CLI invocation)

Read two or three existing integration tests in full to calibrate style, imports,
and setup patterns before generating anything.

### 3. Determine the right test boundary

For each spec item, identify the appropriate test boundary — the level at which
testing the invariant is both meaningful and durable:

**Integration boundary (preferred):** Test at the service or API layer. A spec item
asserting "admin actions require MFA" is best tested by calling the admin endpoint
without MFA and asserting rejection, then with MFA and asserting success. This
catches bypasses regardless of internal structure.

**Unit boundary (fallback):** If the invariant is purely algorithmic (e.g., a
validation rule with no I/O), a focused unit test is acceptable. State the reason
for choosing unit over integration.

Avoid testing at the implementation level (specific function calls, internal state).
Spec tests must survive refactoring.

### 4. Generate the tests

For each uncovered spec item, write one or more tests that together cover:

- **The failure path:** invariant violated → expected rejection/error occurs
- **The success path:** invariant satisfied → expected outcome proceeds normally

Naming convention: embed the spec item ID in the test name so the link is
machine-readable and grep-able:

```
test_SPEC_auth_001_admin_rejected_without_mfa   # pytest / Go
it('SPEC-auth-001: admin action rejected without MFA', ...)  # Jest
```

Place tests in the appropriate location within the project's existing test
directory (match the pattern of existing integration tests). Do not create a
separate `.sdd/` test directory.

### 5. Update the spec item

For each spec item with newly written tests, add a `**Tests:**` block to its file
(`.sdd/specs/{domain}/SPEC-{abbrev}-{seq}.md`) after the statement body:

```markdown
# SPEC-auth-001 — Admin actions require two-factor verification

All admin-privileged operations MUST verify a second factor before proceeding.

**Tests:**
- `tests/integration/test_admin.py::test_SPEC_auth_001_admin_rejected_without_mfa` — "admin action rejected when second factor is absent or expired"
- `tests/integration/test_admin.py::test_SPEC_auth_001_admin_proceeds_with_valid_mfa` — "admin action proceeds when second factor is verified in current session"
```

Format per test entry: `` `file::test_identifier` — "one-line description of what behavior this test exercises" ``

The one-line description must state the behavior, not the assertion. "admin action
rejected when MFA absent" is good. "asserts 403 status code" is not.

For spec items that have no meaningful code boundary (pure documentation, intentional
design decisions, or items that cannot be meaningfully verified by a test), record a
deliberate skip using the convention:

```markdown
**Tests:** skipped — <reason>
```

A skipped item is explicitly accounted for and surfaces as `skipped` in the Hub UI
(distinct from `not-run`). It is preferable to leaving the item blank — blank means
uncovered; `skipped` means deliberately excluded from test coverage.

After updating a spec item file, recompute and update its `version` field in frontmatter
(see `references/schemas.md`, Specs section, for the hash command).

### 6. Write or update the test mapping file

After writing tests and updating spec item files, create or update the per-domain
test mapping file at `.sdd/specs/{domain}/SPEC-{abbrev}.tests.json`. This file
tells the Hub parser how to resolve each spec item's test coverage and compute live
`testStatus` (rather than defaulting every item to `not-run`).

The mapping file schema:

```json
{
  "runner": "vitest",
  "report": "hub/server/test-results/vitest.json",
  "items": {
    "SPEC-ARCH-001": ["substring from fullName that matches this item's tests"],
    "SPEC-ARCH-002": ["another substring"]
  }
}
```

- `runner` — `"vitest"` for Vitest/Jest JSON reporter output; `"maven"` for Surefire XML
- `report` — path (relative to workspace root) where the test runner writes its JSON report
- `items` — map from spec item ID (uppercase) to an array of substring strings; each
  substring must match the `fullName` of at least one test in the report (case-insensitive)
  so `computeTestStatus` can resolve it. Use the same identifier text you linked in the
  `**Tests:**` block.

**Ensure the report path is produced by the test runner.** If the project uses Vitest,
verify (or add) a `--reporter=json --outputFile=<report-path>` flag to the test run
command (or `vitest.config.ts` reporter config). If the report file does not exist at
the declared path after a test run, `testStatus` will remain `not-run` for all items.
Check the project's existing test scripts and reporter configuration before writing the
mapping; add the reporter output if absent.

Skipped items (those with `**Tests:** skipped — <reason>`) should not appear in the
`items` map — the Hub parser reads the skip marker directly from the spec item file.

### 7. Verify the new tests pass

Run the newly written tests:

```bash
# adjust to project's test runner
pytest {test_file}         # Python
npm test -- {test_file}    # Node
go test ./...              # Go
```

If a test fails, the implementation does not yet satisfy the spec item. Report this
explicitly: "SPEC-auth-001 test fails — the invariant is not yet implemented. This
is expected if the target is new. Run /sdd:spec-audit and /sdd:gap-to-work-items
to create work items."

Do not block on failing tests — record the failure in the report and proceed. A
failing spec test is useful signal, not a blocker for writing other tests.

### 8. Report

```
## Spec Test Coverage — authentication — 2026-05-13

### SPEC-auth-001 — Admin actions require two-factor verification
  ✓ tests/integration/test_admin.py::test_SPEC_auth_001_admin_rejected_without_mfa
  ✓ tests/integration/test_admin.py::test_SPEC_auth_001_admin_proceeds_with_valid_mfa
  Status: both tests pass

### SPEC-auth-002 — Session tokens must not persist beyond logout
  ✗ tests/integration/test_session.py::test_SPEC_auth_002_token_cleared_on_logout
  Status: test FAILS — invariant not yet implemented (expected — no closed gaps for this item)

### SPEC-auth-003 — (already covered, skipped)

### SPEC-auth-004 — (skipped — no code boundary)
  **Tests:** skipped — pure documentation item with no verifiable code path

---
2 spec items covered this run.
1 item has a failing test — spec not yet implemented.
1 item recorded as skipped.
Mapping file written: .sdd/specs/authentication/SPEC-auth.tests.json
Spec updated: version fields refreshed.
Next: Run the test suite then check overall state. Run `/sdd:session-start` to proceed.
```

The final line after `---` is conditional on the outcome:
- **Tests written and suite runnable:** `Run the test suite then \`/sdd:session-start\` to see updated state.`
- **No items needed coverage:** `All spec items already have test coverage. Run \`/sdd:session-start\` to see updated state.`

Substitute the actual test command for the project (e.g. `npm test`, `pytest`) if it differs.

## Constraints

- **Tests live in the project, not in `.sdd/`.** Never create test files under `.sdd/`.
- **Match the project's test style.** Read existing tests before writing. Do not
  introduce a new test framework or directory structure.
- **Embed the spec item ID in the test name.** This makes spec→test traceability
  grep-able without reading the spec file.
- **One-line behavior descriptions are mandatory.** Every `**Tests:**` entry needs a
  description that states the behavior, not the implementation detail.
- **Failing tests are informative, not blocking.** A failing spec test means the
  invariant is not yet implemented — this is useful early signal. Do not suppress it.
- **Update the spec version hash after every spec write.** Any edit to a spec file
  requires recomputing the `version` field.
- **Never duplicate tests.** If a test already covers a spec item but was written
  before the `**Tests:**` link existed, add the link rather than generating a new test.
- **Always write the mapping file (step 6).** Linking tests in `**Tests:**` blocks
  without updating `SPEC-{abbrev}.tests.json` leaves the Hub showing `not-run` for
  every item. Both the markdown link and the JSON mapping are required.
- **Skipped items use the convention, not silence.** Write `**Tests:** skipped — <reason>`
  rather than leaving the `**Tests:**` block absent. Skipped items are excluded from
  the `items` map in the JSON mapping file.

## Schema Reference

For spec item schema, `**Tests:**` format, and version hash command:
`references/schemas.md`

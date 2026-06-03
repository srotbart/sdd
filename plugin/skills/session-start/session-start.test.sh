#!/bin/bash
# Tests for session-start SKILL.md — WI-wf-016: design scanning and Designs in progress section
set -e

SKILL=/Users/srotbart/development/workspaces/sdd-repo/plugin/skills/session-start/SKILL.md
pass=0
fail=0

check() {
  local desc="$1"
  local pattern="$2"
  if grep -q "$pattern" "$SKILL"; then
    echo "PASS: $desc"
    pass=$((pass + 1))
  else
    echo "FAIL: $desc"
    echo "      pattern not found: $pattern"
    fail=$((fail + 1))
  fi
}

# Test 1: collect step scans .sdd/design/*/design.md
check \
  "Collect step scans .sdd/design/*/design.md" \
  "\.sdd/design/\*/design\.md"

# Test 2: collect step extracts design name from directory
check \
  "Collect step extracts design name from directory" \
  "design name"

# Test 3: collect step reads design: frontmatter field from targets
check \
  "Collect step reads design: frontmatter field on targets" \
  "design:.*frontmatter"

# Test 4: Designs in progress section listed in render order
check \
  "Designs in progress appears in the ordered section list" \
  "Designs in progress"

# Test 5: section entry format shows design name and path
check \
  "Output format shows design name and path" \
  "sdd/design/{name}/design\.md"

# Test 6: section is omitted when no unmatched designs exist (prose says omit)
check \
  "Section omitted when no entries (omitting any section with no entries)" \
  "omitting any section with no entries"

echo ""
echo "Results: $pass passed, $fail failed"
[ $fail -eq 0 ] && exit 0 || exit 1

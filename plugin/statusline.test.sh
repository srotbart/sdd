#!/bin/bash
# Tests for statusline.sh — WI-wf-018: add targets and specs counts
set -e

SCRIPT=/Users/srotbart/development/workspaces/sdd-repo/plugin/statusline.sh
pass=0
fail=0

check() {
  local desc="$1"
  local pattern="$2"
  if grep -qE "$pattern" "$SCRIPT"; then
    echo "PASS: $desc"
    pass=$((pass + 1))
  else
    echo "FAIL: $desc"
    echo "      pattern not found: $pattern"
    fail=$((fail + 1))
  fi
}

# Test 1: open_targets computed via grep for status: awaiting-user
check \
  "open_targets computed via grep for 'status: awaiting-user'" \
  "grep.*status: awaiting-user"

# Test 2: open_specs computed via find across spec domain subdirectories
check \
  "open_specs computed via find on .sdd/specs excluding archive" \
  'find.*\.sdd/specs.*SPEC-.*archive'

# Test 3: printf line includes open_targets variable
check \
  "printf line references open_targets" \
  'printf.*open_targets'

# Test 4: printf line includes open_specs variable
check \
  "printf line references open_specs" \
  'printf.*open_specs'

# Test 5: output format has targets before specs before gaps before work items
check \
  "output format order: targets · specs · gaps · work items" \
  'targets.*specs.*gaps.*work items'

# Test 6: script exits 0 when sdd_root is empty (no .sdd found)
check \
  "script exits 0 when no .sdd directory found (exit 0 after walk-up)" \
  '\[ -z "\$sdd_root" \] && exit 0'

# Test 7: open_targets excludes archive (grep targets dir, not archive subdir)
check \
  "grep targets dir for awaiting-user (not archive subdir)" \
  'grep.*\.sdd/targets/'

# Now run the script with a real tmpdir to verify output contains all four counts
tmpdir=$(mktemp -d)
cleanup() { rm -rf "$tmpdir"; }
trap cleanup EXIT

# Create minimal .sdd structure
mkdir -p "$tmpdir/.sdd/targets"
mkdir -p "$tmpdir/.sdd/specs/workflow"
mkdir -p "$tmpdir/.sdd/gaps"
mkdir -p "$tmpdir/.sdd/work-items"

# One awaiting-user target
printf -- '---\nid: TGT-001\nstatus: awaiting-user\n---\n' > "$tmpdir/.sdd/targets/TGT-001.md"
# One spec item
printf -- '---\nid: SPEC-wf-001\n---\n' > "$tmpdir/.sdd/specs/workflow/SPEC-wf-001.md"
# One open gap
printf -- '---\nid: GAP-wf-001\n---\n' > "$tmpdir/.sdd/gaps/GAP-wf-001.md"
# One open work item
printf -- '---\nid: WI-wf-001\n---\n' > "$tmpdir/.sdd/work-items/WI-wf-001.md"

input="{\"workspace\": {\"current_dir\": \"$tmpdir\"}}"
output=$(echo "$input" | bash "$SCRIPT" 2>/dev/null || true)

check_output() {
  local desc="$1"
  local pattern="$2"
  if echo "$output" | grep -qE "$pattern"; then
    echo "PASS: $desc"
    pass=$((pass + 1))
  else
    echo "FAIL: $desc"
    echo "      pattern not found in output: $pattern"
    echo "      actual output: $output"
    fail=$((fail + 1))
  fi
}

check_output \
  "output contains '1 targets'" \
  "1 targets"

check_output \
  "output contains '1 specs'" \
  "1 specs"

check_output \
  "output contains '1 gaps'" \
  "1 gaps"

check_output \
  "output contains '1 work items'" \
  "1 work items"

check_output \
  "output contains 'SDD'" \
  "SDD"

# Verify script exits cleanly when no .sdd directory exists
empty_dir=$(mktemp -d)
empty_input="{\"workspace\": {\"current_dir\": \"$empty_dir\"}}"
echo "$empty_input" | bash "$SCRIPT" 2>/dev/null
exit_code=$?
rm -rf "$empty_dir"
if [ $exit_code -eq 0 ]; then
  echo "PASS: script exits 0 when no .sdd directory exists"
  pass=$((pass + 1))
else
  echo "FAIL: script exited $exit_code when no .sdd directory exists (expected 0)"
  fail=$((fail + 1))
fi

echo ""
echo "Results: $pass passed, $fail failed"
[ $fail -eq 0 ] && exit 0 || exit 1

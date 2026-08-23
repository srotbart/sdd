#!/bin/bash
# Tests for explain SKILL.md — WI-wf-017: sdd:explain skill
set -e

SKILL="$(cd "$(dirname "$0")" && pwd)/SKILL.md"
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

check_absent() {
  local desc="$1"
  local pattern="$2"
  if ! grep -q "$pattern" "$SKILL"; then
    echo "PASS: $desc"
    pass=$((pass + 1))
  else
    echo "FAIL: $desc (pattern should be absent)"
    echo "      found: $pattern"
    fail=$((fail + 1))
  fi
}

# Test 1: Skill file exists and has correct name frontmatter
check \
  "Frontmatter sets name: explain" \
  "^name: explain"

# Test 2: No team setup step — Agent tool sets up team context automatically
check \
  "No team setup step is required" \
  "No team setup step is required"

# Test 3: TeamCreate/TeamDelete documented as no longer existing
check \
  "TeamCreate/TeamDelete documented as gone" \
  "tools no longer exist"

# Test 4: team_name input is not passed
check \
  "team_name input is not passed" \
  "ignored, so it is not passed"

# Test 5: Agent is named sdd-explainer
check \
  "Agent name is sdd-explainer" \
  'sdd-explainer'

# Test 6: Agent uses general-purpose subagent type
check \
  "Agent uses general-purpose subagent_type" \
  "general-purpose"

# Test 7: Agent prompt instructs asking interactive vs non-interactive first
check \
  "Agent prompt includes interactive vs non-interactive question" \
  "interactively\|non-interactively\|interactive or non-interactive"

# Test 8: Agent writes skeleton to .sdd/projections/<subject>.md immediately
check \
  "Agent writes skeleton to .sdd/projections/<subject>.md" \
  "\.sdd/projections/{subject}\.md"

# Test 9: Specs consulted before code
check \
  "Specs consulted before code (specs first)" \
  "specs.*first\|Specs before code\|authoritative"

# Test 10: .sdd/projections/ directory created if absent
check \
  "mkdir -p .sdd/projections ensures directory exists" \
  "mkdir -p .sdd/projections\|mkdir.*projections"

# Test 11: Interactive mode writes section then asks user
check \
  "Interactive mode sends user message asking what to explore next" \
  "explore next\|what.*explore\|what should I"

# Test 12: Non-interactive mode traverses autonomously without prompts
check \
  "Non-interactive mode traverses autonomously" \
  "[Nn]on-interactive.*autonom\|autonomously"

echo ""
echo "Results: $pass passed, $fail failed"
[ $fail -eq 0 ] && exit 0 || exit 1

#!/usr/bin/env bash
# lint-check.sh
#
# SDD active-blocking layer for mechanically-checkable coding standards.
#
# Reads the standards rubric from .sdd/standards/ and runs any mechanical
# checks that can be automated. Exits non-zero if any violation is found.
#
# Usage:
#   bash plugin/scripts/lint-check.sh           # run from repo root
#   bash plugin/scripts/lint-check.sh --verbose # show all checked files
#
# Wiring as a git pre-commit hook:
#   ln -sf ../../plugin/scripts/lint-check.sh .git/hooks/pre-commit
#
# Wiring as a CI step (GitHub Actions):
#   - name: Lint check
#     run: bash plugin/scripts/lint-check.sh
#
# NOTE: This script enforces MECHANICALLY-CHECKABLE rules only.
# Judgement-based rules (anti-patterns, architectural rules) are
# handled by /sdd:review-issues using the .sdd/standards/ rubric.
# Do NOT use /sdd:spec-audit as a standards enforcement mechanism.
#
# CUSTOMISE: Add your project's actual linters/formatters below.
# The scaffolded checks are examples — replace or extend them.

set -euo pipefail

VERBOSE="${1:-}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STANDARDS_DIR="$REPO_ROOT/.sdd/standards"
STANDARDS_FILE="$STANDARDS_DIR/standards-template.md"
FAILURES=0

log() {
  echo "$@"
}

verbose() {
  if [[ "$VERBOSE" == "--verbose" ]]; then
    echo "$@"
  fi
}

fail() {
  echo "FAIL: $*" >&2
  FAILURES=$((FAILURES + 1))
}

log "=== SDD Lint Check ==="
log "Repo: $REPO_ROOT"
log "Standards: $STANDARDS_FILE"
log ""

# ─── Check: Standards file exists ────────────────────────────────────────────
if [[ ! -f "$STANDARDS_FILE" ]]; then
  log "INFO: No standards template found at .sdd/standards/standards-template.md"
  log "      Create one to enable standards-based checks."
  log ""
  log "=== SDD Lint Check SKIPPED (no standards defined) ==="
  exit 0
fi

# ─── Check: CLAUDE.md has standards section ───────────────────────────────────
CLAUDE_MD="$REPO_ROOT/CLAUDE.md"
if [[ -f "$CLAUDE_MD" ]]; then
  if grep -q "Coding Standards" "$CLAUDE_MD"; then
    verbose "OK: CLAUDE.md has Coding Standards section"
  else
    fail "CLAUDE.md exists but has no 'Coding Standards' section — add it so standards reach Claude's context"
  fi
else
  log "WARN: CLAUDE.md not found — standards won't reach Claude proactively (run /sdd:session-start for setup)"
fi

# ─── Check: Artifact guide CI check passes ────────────────────────────────────
GUIDE_CHECK="$REPO_ROOT/plugin/scripts/check-artifact-guides.js"
if [[ -f "$GUIDE_CHECK" ]] && command -v node &>/dev/null; then
  verbose "Running artifact guide check..."
  if node "$GUIDE_CHECK" > /dev/null 2>&1; then
    verbose "OK: All artifact guides have all 6 sections"
  else
    fail "Artifact guide check failed — run: node plugin/scripts/check-artifact-guides.js"
  fi
fi

# ─── Check: Skills table drift ────────────────────────────────────────────────
DRIFT_CHECK="$REPO_ROOT/plugin/scripts/check-skills-drift.js"
if [[ -f "$DRIFT_CHECK" ]] && command -v node &>/dev/null; then
  verbose "Running skills table drift check..."
  if node "$DRIFT_CHECK" > /dev/null 2>&1; then
    verbose "OK: README Skills table is in sync with SKILL.md files"
  else
    fail "README Skills table is out of sync — run: node plugin/scripts/gen-skills-table.js"
  fi
fi

# ─── CUSTOMISE: Add your linters below ───────────────────────────────────────
#
# Examples (uncomment and adapt):
#
# ESLint (JavaScript/TypeScript):
# if command -v eslint &>/dev/null; then
#   if eslint . --max-warnings 0 --quiet; then
#     verbose "OK: ESLint passed"
#   else
#     fail "ESLint found violations"
#   fi
# fi
#
# Prettier (formatting):
# if command -v prettier &>/dev/null; then
#   if prettier --check "src/**/*.{ts,tsx,js}"; then
#     verbose "OK: Prettier formatting correct"
#   else
#     fail "Prettier found formatting issues — run: prettier --write ."
#   fi
# fi
#
# Python (flake8/black):
# if command -v flake8 &>/dev/null; then
#   if flake8 . --max-line-length=100; then
#     verbose "OK: flake8 passed"
#   else
#     fail "flake8 found violations"
#   fi
# fi
#
# ─────────────────────────────────────────────────────────────────────────────

log ""
if [[ $FAILURES -gt 0 ]]; then
  log "=== SDD Lint Check FAILED ($FAILURES violation(s)) ==="
  exit 1
else
  log "=== SDD Lint Check PASSED ==="
  exit 0
fi

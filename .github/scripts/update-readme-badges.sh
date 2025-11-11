#!/usr/bin/env bash
set -euo pipefail
HEAD_BRANCH=${HEAD_BRANCH:-${GITHUB_REF_NAME:-unknown}}
REPO=${REPO:-${GITHUB_REPOSITORY:-unknown}}
SAFE_BRANCH=$(echo "$HEAD_BRANCH" | tr '/:' '-')
BADGES_DIR="https://raw.githubusercontent.com/${REPO}/badges/badges"
BUILD_BRANCH_URL="${BADGES_DIR}/build-status-badge-${SAFE_BRANCH}.json"
COVERAGE_BRANCH_URL="${BADGES_DIR}/coverage-badge-${SAFE_BRANCH}.json"
COVERAGE_GATE_BRANCH_URL="${BADGES_DIR}/coverage-gate-badge-${SAFE_BRANCH}.json"
COVERAGE_DELTA_BRANCH_URL="${BADGES_DIR}/coverage-delta-badge-${SAFE_BRANCH}.json"
COVERAGE_TREND_BRANCH_URL="${BADGES_DIR}/coverage-trend-badge-${SAFE_BRANCH}.json"
DIFF_COVERAGE_BRANCH_URL="${BADGES_DIR}/diff-coverage-badge-${SAFE_BRANCH}.json"
DIFF_COVERAGE_BASE_URL="${BADGES_DIR}/diff-coverage-badge-master.json"
RISK_SCORE_BRANCH_URL="${BADGES_DIR}/risk-score-badge-${SAFE_BRANCH}.json"
RISK_SCORE_BASE_URL="${BADGES_DIR}/risk-score-badge-master.json"
BASE_COVERAGE_URL="${BADGES_DIR}/coverage-badge-master.json"
BASE_GATE_URL="${BADGES_DIR}/coverage-gate-badge-master.json"
SONAR_PROJECT_KEY="github_poc-task-manager-herooffer-ghc"
TMP=/tmp/_badge_block.md
{
  echo "<!-- BADGES-AUTO-START -->"
  echo "![Build (${HEAD_BRANCH})](https://img.shields.io/endpoint?url=${BUILD_BRANCH_URL})"
  if [ "$HEAD_BRANCH" != "master" ]; then
    echo "![Coverage (baseline master)](https://img.shields.io/endpoint?url=${BASE_COVERAGE_URL})"
    echo "![Coverage Gate (baseline master)](https://img.shields.io/endpoint?url=${BASE_GATE_URL})"
    echo "![Coverage (this branch)](https://img.shields.io/endpoint?url=${COVERAGE_BRANCH_URL})"
    echo "![Coverage Gate (this branch)](https://img.shields.io/endpoint?url=${COVERAGE_GATE_BRANCH_URL})"
    curl -sf -I "${DIFF_COVERAGE_BASE_URL}" >/dev/null && echo "![Diff Coverage (baseline master)](https://img.shields.io/endpoint?url=${DIFF_COVERAGE_BASE_URL})"
    curl -sf -I "${DIFF_COVERAGE_BRANCH_URL}" >/dev/null && echo "![Diff Coverage (this branch)](https://img.shields.io/endpoint?url=${DIFF_COVERAGE_BRANCH_URL})"
    curl -sf -I "${COVERAGE_DELTA_BRANCH_URL}" >/dev/null && echo "![Coverage Delta](https://img.shields.io/endpoint?url=${COVERAGE_DELTA_BRANCH_URL})"
    curl -sf -I "${COVERAGE_TREND_BRANCH_URL}" >/dev/null && echo "![Coverage Trend](https://img.shields.io/endpoint?url=${COVERAGE_TREND_BRANCH_URL})"
    curl -sf -I "${RISK_SCORE_BASE_URL}" >/dev/null && echo "![Risk Score (baseline)](https://img.shields.io/endpoint?url=${RISK_SCORE_BASE_URL})"
    curl -sf -I "${RISK_SCORE_BRANCH_URL}" >/dev/null && echo "![Risk Score (this branch)](https://img.shields.io/endpoint?url=${RISK_SCORE_BRANCH_URL})"
  else
    echo "![Coverage (baseline)](https://img.shields.io/endpoint?url=${COVERAGE_BRANCH_URL})"
    echo "![Coverage Gate (baseline)](https://img.shields.io/endpoint?url=${COVERAGE_GATE_BRANCH_URL})"
    curl -sf -I "${DIFF_COVERAGE_BRANCH_URL}" >/dev/null && echo "![Diff Coverage](https://img.shields.io/endpoint?url=${DIFF_COVERAGE_BRANCH_URL})"
    curl -sf -I "${RISK_SCORE_BRANCH_URL}" >/dev/null && echo "![Risk Score](https://img.shields.io/endpoint?url=${RISK_SCORE_BRANCH_URL})"
  fi
  echo "![Orchestrator](https://github.com/${REPO}/actions/workflows/orchestrator.yml/badge.svg)"
  for metric in alert_status coverage bugs vulnerabilities code_smells sqale_rating reliability_rating security_rating; do
    echo "![Sonar ${metric}](https://sonarcloud.io/api/project_badges/measure?project=${SONAR_PROJECT_KEY}&metric=${metric})"
  done
  echo "<!-- BADGES-AUTO-END -->"
} > "$TMP"
# Inject or replace block in README
if grep -q 'BADGES-AUTO-START' README.md; then
  sed -i '/BADGES-AUTO-START/,/BADGES-AUTO-END/d' README.md
fi
if grep -n '^# ' README.md >/dev/null; then
  awk 'NR==1{print; system("cat '"$TMP"'"); next} {print}' README.md > README.new && mv README.new README.md
else
  cat "$TMP" README.md > README.new && mv README.new README.md
fi
git config user.name "github-actions"
git config user.email "actions@github.com"
git add README.md || true
if git diff --cached --quiet; then
  echo "README unchanged"
else
  git commit -m "docs(badges): update README badges block for ${HEAD_BRANCH}" || true
fi

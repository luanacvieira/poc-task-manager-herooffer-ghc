#!/usr/bin/env bash
set -euo pipefail

# Enhanced Coverage Gate - Individual Component Verification
# Requires 80% coverage on backend, frontend, and combined

echo "=== ENHANCED COVERAGE GATE - 80% REQUIREMENT ==="

# Discover backend and frontend coverage-summary.json files
BACK=$(find coverage-artifacts/backend-coverage -maxdepth 2 -name 'coverage-summary.json' | head -n1 || true)
FRONT=$(find coverage-artifacts/frontend-coverage -maxdepth 2 -name 'coverage-summary.json' | head -n1 || true)

if [ -z "$BACK" ] || [ -z "$FRONT" ]; then 
    echo "::error::Missing coverage summaries"
    exit 1
fi

echo "Backend coverage: $BACK"
echo "Frontend coverage: $FRONT"

# Parse individual coverage
BACKEND_COVERAGE=$(node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$BACK', 'utf8'));
const total = data.total;
const avg = (
    parseFloat(total.lines.pct) + 
    parseFloat(total.statements.pct) + 
    parseFloat(total.functions.pct) + 
    parseFloat(total.branches.pct)
) / 4;
console.log(avg.toFixed(2));
")

FRONTEND_COVERAGE=$(node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$FRONT', 'utf8'));
const total = data.total;
const avg = (
    parseFloat(total.lines.pct) + 
    parseFloat(total.statements.pct) + 
    parseFloat(total.functions.pct) + 
    parseFloat(total.branches.pct)
) / 4;
console.log(avg.toFixed(2));
")

echo "=== INDIVIDUAL COVERAGE RESULTS ==="
echo "Backend Coverage: ${BACKEND_COVERAGE}%"
echo "Frontend Coverage: ${FRONTEND_COVERAGE}%"

# Check individual thresholds using node for comparison
BACKEND_PASS=false
FRONTEND_PASS=false
THRESHOLD=80

BACKEND_CHECK=$(node -e "console.log(parseFloat('$BACKEND_COVERAGE') >= $THRESHOLD ? 'true' : 'false')")
FRONTEND_CHECK=$(node -e "console.log(parseFloat('$FRONTEND_COVERAGE') >= $THRESHOLD ? 'true' : 'false')")

if [ "$BACKEND_CHECK" = "true" ]; then
    BACKEND_PASS=true
    echo "✅ Backend Coverage: ${BACKEND_COVERAGE}% >= ${THRESHOLD}%"
else
    echo "❌ Backend Coverage: ${BACKEND_COVERAGE}% < ${THRESHOLD}%"
fi

if [ "$FRONTEND_CHECK" = "true" ]; then
    FRONTEND_PASS=true
    echo "✅ Frontend Coverage: ${FRONTEND_COVERAGE}% >= ${THRESHOLD}%"
else
    echo "❌ Frontend Coverage: ${FRONTEND_COVERAGE}% < ${THRESHOLD}%"
fi

# Run combined coverage
echo "=== COMBINED COVERAGE ANALYSIS ==="
node .github/scripts/combine-coverage.js "$BACK" "$FRONT"
COMBINED_AVG=$(jq -r '.avg' combined-coverage/coverage-metrics.json)
COMBINED_PASS=$(jq -r '.pass' combined-coverage/coverage-metrics.json)

echo "Combined Coverage: ${COMBINED_AVG}%"

# Final gate decision
if [ "$BACKEND_PASS" = true ] && [ "$FRONTEND_PASS" = true ] && [ "$COMBINED_PASS" = true ]; then
    echo "🎉 ALL COVERAGE GATES PASSED!"
    echo "✅ Backend: ${BACKEND_COVERAGE}% >= 80%"
    echo "✅ Frontend: ${FRONTEND_COVERAGE}% >= 80%" 
    echo "✅ Combined: ${COMBINED_AVG}% with all metrics >= 80%"
    FINAL_GATE="pass"
else
    echo "🚫 COVERAGE GATE FAILED!"
    echo "Backend: ${BACKEND_COVERAGE}% ($([ "$BACKEND_PASS" = true ] && echo "✅ PASS" || echo "❌ FAIL"))"
    echo "Frontend: ${FRONTEND_COVERAGE}% ($([ "$FRONTEND_PASS" = true ] && echo "✅ PASS" || echo "❌ FAIL"))"
    echo "Combined: ${COMBINED_AVG}% ($([ "$COMBINED_PASS" = true ] && echo "✅ PASS" || echo "❌ FAIL"))"
    FINAL_GATE="fail"
    exit 1
fi

# Output for GitHub Actions
echo "avg=$COMBINED_AVG" >> "$GITHUB_OUTPUT"
echo "gate=$FINAL_GATE" >> "$GITHUB_OUTPUT"
echo "backend_coverage=$BACKEND_COVERAGE" >> "$GITHUB_OUTPUT"
echo "frontend_coverage=$FRONTEND_COVERAGE" >> "$GITHUB_OUTPUT"
echo "backend_pass=$BACKEND_PASS" >> "$GITHUB_OUTPUT"
echo "frontend_pass=$FRONTEND_PASS" >> "$GITHUB_OUTPUT"
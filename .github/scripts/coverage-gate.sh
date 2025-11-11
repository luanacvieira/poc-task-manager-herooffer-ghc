#!/usr/bin/env bash
set -euo pipefail
# Discover backend and frontend coverage-summary.json files from downloaded artifacts
BACK=$(find coverage-artifacts/backend-coverage -maxdepth 2 -name 'coverage-summary.json' | head -n1 || true)
FRONT=$(find coverage-artifacts/frontend-coverage -maxdepth 2 -name 'coverage-summary.json' | head -n1 || true)
if [ -z "$BACK" ] || [ -z "$FRONT" ]; then echo "::error::Missing coverage summaries"; exit 1; fi
node .github/scripts/combine-coverage.js "$BACK" "$FRONT"
AVG=$(jq -r '.avg' combined-coverage/coverage-metrics.json)
GATE=$(jq -r '.pass' combined-coverage/coverage-metrics.json | sed 's/true/pass/;s/false/fail/')
echo "avg=$AVG" >> "$GITHUB_OUTPUT"
echo "gate=$GATE" >> "$GITHUB_OUTPUT"

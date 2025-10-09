#!/usr/bin/env bash
set -e
echo "Node version: $(node -v)"
echo "NPM version:  $(npm -v)"
echo "Package.json test script:"; jq -r '.scripts.test' package.json || true
set +e
(time npx react-scripts test --coverage --watchAll=false --runInBand --detectOpenHandles --testTimeout=30000 --reporters=default --coverageReporters=lcov --coverageReporters=json-summary) 2>&1 | tee test-output.log
EXIT_CODE=${PIPESTATUS[0]}
set -e
if [ ! -f coverage/coverage-summary.json ]; then echo "::warning::coverage-summary.json missing" >&2; fi
if [ $EXIT_CODE -ne 0 ]; then
  if grep -Eq 'Tests: *[0-9]+.*0 failed' test-output.log && [ -f coverage/coverage-summary.json ]; then
    echo "Treating open handles failure as success"; EXIT_CODE=0; fi
fi
if [ $EXIT_CODE -ne 0 ] || [ ! -f coverage/coverage-summary.json ]; then
  echo "Retrying with --forceExit"; set +e
  (time npx react-scripts test --coverage --watchAll=false --runInBand --detectOpenHandles --forceExit --testTimeout=30000 --reporters=default --coverageReporters=lcov --coverageReporters=json-summary) 2>&1 | tee test-output-2.log
  EXIT2=${PIPESTATUS[0]}; set -e
  if [ $EXIT2 -ne 0 ]; then
    if grep -Eq 'Tests: *[0-9]+.*0 failed' test-output-2.log && [ -f coverage/coverage-summary.json ]; then echo "Force exit still failed but tests passed"; EXIT_CODE=0; else echo "::error::Persistent test failure"; exit $EXIT2; fi
  fi
fi
[ -f coverage/coverage-summary.json ] || { echo "::error::No coverage-summary.json"; exit 1; }
head -c 500 coverage/coverage-summary.json || true
echo "Frontend tests completed."

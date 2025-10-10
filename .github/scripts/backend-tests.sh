#!/usr/bin/env bash
set -euo pipefail
npx jest --config jest.config.unit.js --coverage --coverageDirectory coverage-unit --reporters=default --coverageReporters=text --coverageReporters=lcov --coverageReporters=json-summary
if [ -f jest.config.integration.js ]; then npx jest --config jest.config.integration.js; fi

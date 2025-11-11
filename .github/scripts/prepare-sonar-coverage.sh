#!/usr/bin/env bash
set -euo pipefail
# Prepare backend and frontend coverage lcov files out of downloaded artifacts
# Expects artifacts placed in directories:
#  backend-coverage-artifact
#  frontend-coverage-artifact
mkdir -p backend/coverage-unit frontend/coverage
BACK_LCOV=$(find backend-coverage-artifact -maxdepth 3 -type f -name 'lcov.info' | head -n1 || true)
if [ -n "${BACK_LCOV}" ]; then
  cp "${BACK_LCOV}" backend/coverage-unit/lcov.info
else
  echo '::warning::Backend lcov.info não encontrado no artifact'
fi
FRONT_LCOV=$(find frontend-coverage-artifact -maxdepth 3 -type f -name 'lcov.info' | head -n1 || true)
if [ -n "${FRONT_LCOV}" ]; then
  cp "${FRONT_LCOV}" frontend/coverage/lcov.info
else
  echo '::warning::Frontend lcov.info não encontrado no artifact'
fi
ls -l backend/coverage-unit || true
ls -l frontend/coverage || true

#!/usr/bin/env bash
set -euo pipefail
# Guard: skip sonar for external PR or missing token
if [ "${GITHUB_EVENT_NAME}" = "pull_request" ] && [ "${PR_HEAD_REPO}" != "${GITHUB_REPOSITORY}" ]; then
	echo "SKIP=true" >> "$GITHUB_OUTPUT"
	echo "::warning::External PR (fork) - skipping Sonar."
	exit 0
fi
if [ -z "${SONAR_TOKEN:-}" ]; then
	echo "SKIP=true" >> "$GITHUB_OUTPUT"
	echo "::warning::SONAR_TOKEN missing - skipping Sonar."
	exit 0
fi
echo "SKIP=false" >> "$GITHUB_OUTPUT"
# Prepare coverage files (expects artifacts downloaded into backend-coverage-artifact / frontend-coverage-artifact)
mkdir -p backend/coverage-unit frontend/coverage
BACK_LCOV=$(find backend-coverage-artifact -maxdepth 2 -type f -name 'lcov.info' | head -n1 || true)
FRONT_LCOV=$(find frontend-coverage-artifact -maxdepth 2 -type f -name 'lcov.info' | head -n1 || true)
[ -n "$BACK_LCOV" ] && cp "$BACK_LCOV" backend/coverage-unit/lcov.info || echo '::warning::Backend lcov.info not found'
[ -n "$FRONT_LCOV" ] && cp "$FRONT_LCOV" frontend/coverage/lcov.info || echo '::warning::Frontend lcov.info not found'
ls -l backend/coverage-unit || true
ls -l frontend/coverage || true

#!/usr/bin/env bash
set -euo pipefail
{
  echo "### Pipeline Orchestrator"
  echo "Lint: ${LINT_RESULT}"      
  echo "Typecheck: ${TYPECHECK_RESULT}" 
  echo "Backend Tests: ${BACKEND_TEST_RESULT}" 
  echo "Frontend Tests: ${FRONTEND_TEST_RESULT}" 
  echo "Coverage Gate: ${COVERAGE_RESULT} (avg=${COVERAGE_AVG} gate=${COVERAGE_GATE})" 
  echo "Build Backend: ${BUILD_BACKEND_RESULT}" 
  echo "Build Frontend: ${BUILD_FRONTEND_RESULT}" 
  echo "CodeQL: ${CODEQL_RESULT}" 
  echo "Sonar: ${SONAR_RESULT}" 
  if [ -n "${DIFF_PCT:-}" ]; then echo "Diff Coverage: ${DIFF_RESULT} (pct=${DIFF_PCT})"; fi
  echo "SBOM: ${SBOM_RESULT}" 
} >> "$GITHUB_STEP_SUMMARY"

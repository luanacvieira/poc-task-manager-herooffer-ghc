#!/usr/bin/env bash
set -euo pipefail
# Master finalize script: aggregates summary, artifacts, coverage html, gh-pages, security signals, badges, PR comment, README badges.

EVENT_NAME="${GITHUB_EVENT_NAME:-}" # push or pull_request etc

# Provide safe defaults so sourced/child scripts referencing these vars don't break (unbound vars with set -u)
export LINT_RESULT="${LINT_RESULT:-unknown}"
export TYPECHECK_RESULT="${TYPECHECK_RESULT:-unknown}"
export BACKEND_TEST_RESULT="${BACKEND_TEST_RESULT:-unknown}"
export FRONTEND_TEST_RESULT="${FRONTEND_TEST_RESULT:-unknown}"
export COVERAGE_RESULT="${COVERAGE_RESULT:-unknown}"
export COVERAGE_AVG="${COV_AVG:-${COVERAGE_AVG:-n/a}}"
export COVERAGE_GATE="${COV_GATE:-${COVERAGE_GATE:-n/a}}"
export BUILD_BACKEND_RESULT="${BUILD_BACKEND_RESULT:-unknown}"
export BUILD_FRONTEND_RESULT="${BUILD_FRONTEND_RESULT:-unknown}"
export CODEQL_RESULT="${CODEQL_RESULT:-unknown}"
export SONAR_RESULT="${SONAR_RESULT:-unknown}"
export DIFF_RESULT="${DIFF_RESULT:-unknown}"
export DIFF_PCT="${DIFF_PCT:-}" # may be empty for push events
export SBOM_RESULT="${SBOM_RESULT:-unknown}"

# 1. Always append summary header parts
bash .github/scripts/final-summary.sh

if [ "$EVENT_NAME" = "pull_request" ]; then
  echo "Finalize PR flow: posting coverage delta comment"
  node .github/scripts/pr-coverage-comment.js || echo "(warn) pr comment generation falhou"
  if command -v gh >/dev/null 2>&1 && [ -f pr-comment-body.txt ]; then
    gh api repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments -f body="$(cat pr-comment-body.txt)" || echo "(non-blocking) falha ao postar PR comment"
  fi
fi

if [ "$EVENT_NAME" = "push" ]; then
  echo "Finalize push flow: baixando artifacts e gerando assets"
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    bash .github/scripts/download-artifacts.sh || echo "(warn) download-artifacts falhou"
  else
    echo "(warn) GITHUB_TOKEN ausente para download via API"
  fi
  bash .github/scripts/coverage-html.sh || echo "(warn) coverage-html falhou"
  bash .github/scripts/publish-gh-pages.sh || echo "(warn) publish-gh-pages falhou"
  # License optional check
  if [ ! -f license-artifact/license-signals.json ]; then
    echo "(Info) license-signals artifact ausente - seguindo sem penalidades de licença."
  else
    echo "License signals artifact presente."
  fi
  # Security signals
  bash .github/scripts/security-signals.sh || echo "(warn) security-signals falhou"
  # Badges (export expected env before calling)
  bash .github/scripts/badges.sh || echo "(warn) badges falhou"
  # README badges update
  bash .github/scripts/update-readme-badges.sh || echo "(warn) update-readme-badges falhou"
  if git diff --quiet README.md; then
    echo "README sem alterações de badges"
  else
    git config user.name "ci-bot" || true
    git config user.email "ci-bot@users.noreply.github.com" || true
    git add README.md || true
    git commit -m "docs(badges): update badges block [ci skip]" || true
    git push origin "${GITHUB_REF_NAME}" || echo "(info) push README falhou (non-blocking)"
  fi
fi

echo "Finalize concluído."

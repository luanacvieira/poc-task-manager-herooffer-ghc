#!/usr/bin/env bash
set -euo pipefail
BRANCH_GHPAGES=gh-pages
git fetch origin $BRANCH_GHPAGES || true
if git show-ref --verify --quiet refs/remotes/origin/$BRANCH_GHPAGES; then
  git checkout $BRANCH_GHPAGES
  git reset --hard origin/$BRANCH_GHPAGES
else
  git checkout --orphan $BRANCH_GHPAGES
  git rm -rf . 2>/dev/null || true
  rm -rf * .[^.]* 2>/dev/null || true
fi
mkdir -p coverage
rm -rf coverage/backend coverage/frontend || true
cp -R ../coverage-html/backend coverage/ 2>/dev/null || true
cp -R ../coverage-html/frontend coverage/ 2>/dev/null || true
cp ../coverage-html/index.html coverage/index.html 2>/dev/null || true
git config user.name "github-actions"
git config user.email "actions@github.com"
git add coverage || true
if git diff --cached --quiet; then
  echo "No coverage HTML changes to commit"
else
  git commit -m "chore: update coverage HTML (orchestrator)"
  git push origin HEAD:$BRANCH_GHPAGES || echo "Push to gh-pages failed (branch protection?)"
fi

#!/usr/bin/env bash
set -euo pipefail
# Determine changed source files for diff coverage
TARGET_FILE=${1:-changed.txt}
: > "$TARGET_FILE"
if [ "$GITHUB_EVENT_NAME" = "pull_request" ]; then
  BASE_REF="$PR_BASE_REF"
  git fetch origin "$BASE_REF:$BASE_REF" || true
  git diff --name-only "origin/$BASE_REF...HEAD" | grep -E '^(backend|frontend)/src/' || true >> "$TARGET_FILE"
else
  if git rev-parse HEAD~1 >/dev/null 2>&1; then
    git diff --name-only HEAD~1..HEAD | grep -E '^(backend|frontend)/src/' || true >> "$TARGET_FILE"
  fi
fi
echo "Changed files:"; cat "$TARGET_FILE" || true
# Emit multiline output for GitHub Actions
{
  echo 'list<<CHANGED_EOF'
  cat "$TARGET_FILE"
  echo 'CHANGED_EOF'
} >> "$GITHUB_OUTPUT"

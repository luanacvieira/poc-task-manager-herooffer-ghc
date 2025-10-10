#!/usr/bin/env bash
set -euo pipefail
# Download multiple artifacts via GitHub API to reduce many workflow steps.
# Requires: GITHUB_TOKEN env and gh CLI available.
# Artifacts to fetch (space separated)
ARTIFACTS="combined-coverage backend-coverage frontend-coverage diff-coverage semgrep-sarif gitleaks-sarif secret-signals sbom license-signals"
REPO="${GITHUB_REPOSITORY:?}" # owner/repo

have_gh(){ command -v gh >/dev/null 2>&1; }
if ! have_gh; then
  echo "::error::gh CLI não encontrado no runner."; exit 1; fi

# Enable pagination just in case
JSON=$(gh api -H "Accept: application/vnd.github+json" repos/$REPO/actions/artifacts --paginate || true)
if [ -z "$JSON" ]; then echo "::warning::Nenhuma lista de artifacts retornada"; fi

for NAME in $ARTIFACTS; do
  ID=$(echo "$JSON" | jq -r --arg N "$NAME" '.artifacts[]? | select(.name==$N) | .id' | head -n1 || true)
  if [ -z "$ID" ]; then
    echo "(info) Artifact '$NAME' não encontrado, continuando."; continue
  fi
  echo "Baixando artifact $NAME (id=$ID)";
  TMPDIR="artifact-tmp-$NAME"
  rm -rf "$TMPDIR" && mkdir -p "$TMPDIR"
  gh api -H "Accept: application/vnd.github+json" \
    repos/$REPO/actions/artifacts/$ID/zip > "$TMPDIR/$NAME.zip" || { echo "::warning::Falha download $NAME"; continue; }
  unzip -q "$TMPDIR/$NAME.zip" -d "$TMPDIR/unzip" || echo "::warning::Falha unzip $NAME";
  rm -f "$TMPDIR/$NAME.zip"

  # Map artifact names to legacy directory layout expected by scripts
  case "$NAME" in
    combined-coverage)
      # expected: combined-coverage/*
      mkdir -p combined-coverage
      cp -R "$TMPDIR/unzip"/* combined-coverage/ 2>/dev/null || true
      ;;
    backend-coverage)
      # expected: backend-coverage-artifact/* (for html) & for Sonar preparation script we look inside backend-coverage-artifact
      mkdir -p backend-coverage-artifact
      cp -R "$TMPDIR/unzip"/* backend-coverage-artifact/ 2>/dev/null || true
      ;;
    frontend-coverage)
      mkdir -p frontend-coverage-artifact
      cp -R "$TMPDIR/unzip"/* frontend-coverage-artifact/ 2>/dev/null || true
      ;;
    diff-coverage)
      # expected by badges: diff-coverage/diff-coverage-badge.json
      mkdir -p diff-coverage
      cp -R "$TMPDIR/unzip"/* diff-coverage/ 2>/dev/null || true
      ;;
    semgrep-sarif)
      # expected: semgrep-artifact/semgrep.sarif
      mkdir -p semgrep-artifact
      # artifact likely contains semgrep.sarif at root
      find "$TMPDIR/unzip" -maxdepth 2 -type f -name 'semgrep.sarif' -exec cp {} semgrep-artifact/ \; || true
      ;;
    gitleaks-sarif)
      mkdir -p gitleaks-artifact
      find "$TMPDIR/unzip" -maxdepth 2 -type f -name 'gitleaks.sarif' -exec cp {} gitleaks-artifact/ \; || true
      # secret-signals.json might have been produced earlier but keep separate
      ;;
    secret-signals)
      mkdir -p secret-artifact
      find "$TMPDIR/unzip" -maxdepth 2 -type f -name 'secret-signals.json' -exec cp {} secret-artifact/ \; || true
      ;;
    sbom)
      mkdir -p sbom-artifact
      cp -R "$TMPDIR/unzip"/* sbom-artifact/ 2>/dev/null || true
      ;;
    license-signals)
      mkdir -p license-artifact
      find "$TMPDIR/unzip" -maxdepth 2 -type f -name 'license-signals.json' -exec cp {} license-artifact/ \; || true
      ;;
  esac
  rm -rf "$TMPDIR"
done

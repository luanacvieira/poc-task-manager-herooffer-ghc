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
  OUTDIR="${NAME}-artifact"
  mkdir -p "$OUTDIR"
  # Download zip
  gh api -H "Accept: application/vnd.github+json" \
    repos/$REPO/actions/artifacts/$ID/zip > "$OUTDIR/$NAME.zip" || { echo "::warning::Falha download $NAME"; continue; }
  unzip -q "$OUTDIR/$NAME.zip" -d "$OUTDIR" || echo "::warning::Falha unzip $NAME";
  rm -f "$OUTDIR/$NAME.zip"
  ls -1 "$OUTDIR" || true
  # Backwards compatibility: some later scripts expect specific path names
  case "$NAME" in
    combined-coverage) ;;
    backend-coverage) ;; # used just for lcov relocation earlier
    frontend-coverage) ;;
    diff-coverage) ;;
    semgrep-sarif) ;;
    gitleaks-sarif) ;;
    secret-signals) ;;
    sbom) ;;
    license-signals) ;;
  esac
done

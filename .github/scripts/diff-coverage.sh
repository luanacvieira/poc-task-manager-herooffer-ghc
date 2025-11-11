#!/usr/bin/env bash
set -euo pipefail
CHANGED_LIST_CONTENT=${CHANGED_LIST:-""}
THRESHOLD=${DIFF_THRESHOLD:-80}
ARTIFACT_ROOT=${ARTIFACT_ROOT:-diff-cov-artifacts}
mkdir -p diff-coverage
if [ -z "${CHANGED_LIST_CONTENT// /}" ]; then
  echo "No changed source files; marking pass with 100%."
  echo '{"schemaVersion":1,"label":"diff coverage","message":"100%","color":"brightgreen"}' > diff-coverage/diff-coverage-badge.json
  echo "pct=100" >> "$GITHUB_OUTPUT"
  echo "pass=true" >> "$GITHUB_OUTPUT"
  exit 0
fi
# Collect lcov files
mapfile -t LCOVS < <(find "$ARTIFACT_ROOT" -type f -name lcov.info 2>/dev/null || true)
if [ ${#LCOVS[@]} -eq 0 ]; then
  echo "::error::No lcov.info files found in artifacts"
  echo "pct=0" >> "$GITHUB_OUTPUT"
  echo "pass=false" >> "$GITHUB_OUTPUT"
  exit 1
fi
# Normalize changed list into array
IFS=$'\n' read -r -d '' -a CHANGED_ARR < <(printf '%s\n' "$CHANGED_LIST_CONTENT" | sed '/^$/d' && printf '\0') || true
TOTAL=0; COVERED=0
for FILE in "${LCOVS[@]}"; do
  CURRENT=""
  declare -a LINES=()
  while IFS= read -r LINE || [ -n "$LINE" ]; do
    if [[ $LINE == SF:* ]]; then
      CURRENT=${LINE#SF:}
      LINES=()
    elif [[ $LINE == DA:* ]]; then
      IFS=',' read -r LN HITS <<< "${LINE#DA:}"
      LINES+=("$LN:$HITS")
    elif [[ $LINE == end_of_record* ]]; then
      if [ -n "$CURRENT" ]; then
        SHORT=${CURRENT#*backend/}; SHORT_ALT=${CURRENT#*frontend/}
        for CH in "${CHANGED_ARR[@]}"; do
          if [[ "$CURRENT" == *"$CH"* ]] || [[ "$SHORT" == *"$CH"* ]] || [[ "$SHORT_ALT" == *"$CH"* ]]; then
            for P in "${LINES[@]}"; do
              IFS=':' read -r L H <<< "$P"; TOTAL=$((TOTAL+1)); if [ "$H" -gt 0 ]; then COVERED=$((COVERED+1)); fi
            done
            break
          fi
        done
      fi
      CURRENT=""; LINES=()
    fi
  done < "$FILE"
  unset LINES
done
PCT=100
if [ $TOTAL -gt 0 ]; then
  PCT=$(awk 'BEGIN{printf "%.2f", (('$COVERED')/('$TOTAL'))*100}')
fi
PASS=false
awk 'BEGIN{exit !('"$PCT"' >= '"$THRESHOLD"')}' && PASS=true || PASS=false
COLOR=red
awk 'BEGIN{exit !('"$PCT"' >= 60)}' && COLOR=orange || true
awk 'BEGIN{exit !('"$PCT"' >= '"$THRESHOLD"')}' && COLOR=green || true
awk 'BEGIN{exit !('"$PCT"' >= 90)}' && COLOR=brightgreen || true
printf '{"schemaVersion":1,"label":"diff coverage","message":"%s%%","color":"%s"}' "$PCT" "$COLOR" > diff-coverage/diff-coverage-badge.json
printf 'pct=%s\n' "$PCT" >> "$GITHUB_OUTPUT"
printf 'pass=%s\n' "$PASS" >> "$GITHUB_OUTPUT"
if [ "$PASS" = false ]; then
  echo "::error::Diff coverage below threshold ($THRESHOLD%) -> $PCT%"
  exit 1
fi

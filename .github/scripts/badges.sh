#!/usr/bin/env bash
set -euo pipefail
SAFE_BRANCH=$(echo "${GITHUB_REF_NAME}" | tr '/' '-' | tr '[:upper:]' '[:lower:]')
mkdir -p badges/history
SONAR_BLOCKER=${SONAR_BLOCKER:-0}
SONAR_CRITICAL=${SONAR_CRITICAL:-0}
SONAR_MAJOR=${SONAR_MAJOR:-0}
SONAR_MINOR=${SONAR_MINOR:-0}
CRIT_COUNT=$(( ${CRIT_COUNT:-0} + SONAR_BLOCKER + SONAR_CRITICAL ))
HIGH_COUNT=$(( ${HIGH_COUNT:-0} + SONAR_MAJOR ))
MED_COUNT=$(( ${MED_COUNT:-0} + SONAR_MINOR ))
COV_AVG=${COV_AVG:-0}
COV_GATE=${COV_GATE:-fail}
DIFF_PCT=${DIFF_PCT:-0}
CODEQL_RESULT=${CODEQL_RESULT:-failure}
SONAR_RESULT=${SONAR_RESULT:-failure}
SEMGREP_RESULT=${SEMGREP_RESULT:-failure}
risk=100
[ "$COV_GATE" = "fail" ] && risk=$((risk-30))
if echo "$COV_AVG" | grep -Eq '^[0-9]+(\.[0-9]+)?$'; then
  awk 'BEGIN{exit !('$COV_AVG' < 85)}' || risk=$((risk-10))
  awk 'BEGIN{exit !('$COV_AVG' >= 85 && '$COV_AVG' < 90)}' && risk=$((risk-5)) || true
fi
if echo "$DIFF_PCT" | grep -Eq '^[0-9]+(\.[0-9]+)?$'; then
  awk 'BEGIN{exit !('$DIFF_PCT' < 80)}' || risk=$((risk-15))
  awk 'BEGIN{exit !('$DIFF_PCT' >= 80 && '$DIFF_PCT' < 90)}' && risk=$((risk-5)) || true
fi
[ "$CODEQL_RESULT" = "success" ] || risk=$((risk-10))
[ "$SEMGREP_RESULT" = "success" ] || risk=$((risk-10))
[ "$SONAR_RESULT" = "success" ] || risk=$((risk-10))
sev_penalty=$((CRIT_COUNT*12 + HIGH_COUNT*6 + MED_COUNT*3))
[ $sev_penalty -gt 40 ] && sev_penalty=40 || true
risk=$((risk - sev_penalty))
[ $risk -lt 0 ] && risk=0 || true
[ $risk -gt 100 ] && risk=100 || true
if [ $risk -ge 90 ]; then RISK_COLOR=brightgreen; elif [ $risk -ge 75 ]; then RISK_COLOR=green; elif [ $risk -ge 60 ]; then RISK_COLOR=yellow; elif [ $risk -ge 40 ]; then RISK_COLOR=orange; else RISK_COLOR=red; fi
echo '{"schemaVersion":1,"label":"risk score","message":"'"$risk"'","color":"'"$RISK_COLOR"'"}' > badges/risk-score-badge.json
cp badges/risk-score-badge.json badges/risk-score-badge-${SAFE_BRANCH}.json || true
if [ -f diff-coverage/diff-coverage-badge.json ]; then cp diff-coverage/diff-coverage-badge.json badges/diff-coverage-badge.json; fi
if [ -f combined-coverage/coverage-badge.json ]; then cp combined-coverage/coverage-badge.json badges/coverage-badge.json; cp combined-coverage/coverage-badge.json "badges/coverage-badge-${SAFE_BRANCH}.json" || true; fi
if [ -f combined-coverage/coverage-gate-badge.json ]; then cp combined-coverage/coverage-gate-badge.json badges/coverage-gate-badge.json; fi
# --- Build Status Badge (aggregate pipeline health) ---
BUILD_STATUS="failing"
if [ "${CODEQL_RESULT}" = "success" ] && [ "${SEMGREP_RESULT}" = "success" ] && [ "${SONAR_RESULT}" = "success" ] && [ "${COV_GATE}" = "pass" ]; then
  BUILD_STATUS="passing"
fi
BUILD_COLOR="red"
if [ "$BUILD_STATUS" = "passing" ]; then BUILD_COLOR="green"; fi
echo '{"schemaVersion":1,"label":"build status","message":"'"$BUILD_STATUS"'","color":"'"$BUILD_COLOR"'"}' > badges/build-status-badge.json
cp badges/build-status-badge.json badges/build-status-badge-${SAFE_BRANCH}.json || true

# --- Coverage Delta Badge (vs baseline master) ---
BASE_BRANCH="master"
BASE_SAFE=$(echo "$BASE_BRANCH" | tr '/' '-' | tr '[:upper:]' '[:lower:]')
DELTA_COLOR="lightgrey"
if echo "$COV_AVG" | grep -Eq '^[0-9]+(\.[0-9]+)?$'; then
  # Try fetch baseline coverage badge JSON from badges branch (raw githubusercontent)
  RAW_URL="https://raw.githubusercontent.com/${GITHUB_REPOSITORY}/badges/badges/coverage-badge-${BASE_SAFE}.json"
  BASE_COV_JSON=$(curl -sfL "$RAW_URL" || true)
  if [ -n "$BASE_COV_JSON" ]; then
    BASE_COV=$(echo "$BASE_COV_JSON" | jq -r '.message' 2>/dev/null | sed 's/%//')
    if echo "$BASE_COV" | grep -Eq '^[0-9]+(\.[0-9]+)?$'; then
      DELTA=$(awk 'BEGIN{printf "%.2f", ('"$COV_AVG"' - '"$BASE_COV"') }')
      SIGNED_DELTA=$(awk 'BEGIN{d='"$DELTA"'; if(d>0)printf "+%.2f%%", d; else printf "%.2f%%", d}')
      # Color logic
      awk 'BEGIN{exit !('"$DELTA"' >= 0.5)}' && DELTA_COLOR=brightgreen || true
      awk 'BEGIN{exit !('"$DELTA"' < 0.5 && '"$DELTA"' > -0.5)}' && DELTA_COLOR=lightgrey || true
      awk 'BEGIN{exit !('"$DELTA"' <= -0.5 && '"$DELTA"' > -2)}' && DELTA_COLOR=orange || true
      awk 'BEGIN{exit !('"$DELTA"' <= -2)}' && DELTA_COLOR=red || true
      echo '{"schemaVersion":1,"label":"coverage delta","message":"'"$SIGNED_DELTA"'","color":"'"$DELTA_COLOR"'"}' > badges/coverage-delta-badge.json
      cp badges/coverage-delta-badge.json badges/coverage-delta-badge-${SAFE_BRANCH}.json || true
    fi
  fi
fi

# --- Coverage Trend Badge (history for this branch) ---
HIST_FILE="badges/history/coverage-history.json"
if echo "$COV_AVG" | grep -Eq '^[0-9]+(\.[0-9]+)?$'; then
  # Append current record
  TS=$(date +%s)
  if [ -f "$HIST_FILE" ]; then
    jq ". + [{\"ts\":$TS,\"branch\":\"$SAFE_BRANCH\",\"avg\":$COV_AVG}]" "$HIST_FILE" 2>/dev/null > "$HIST_FILE.tmp" || echo "[]" > "$HIST_FILE.tmp"
    mv "$HIST_FILE.tmp" "$HIST_FILE"
  else
    echo "[{\"ts\":$TS,\"branch\":\"$SAFE_BRANCH\",\"avg\":$COV_AVG}]" > "$HIST_FILE"
  fi
  # Determine previous coverage value for same branch
  PREV=$(jq -r '[.[]|select(.branch=="'$SAFE_BRANCH'")]|sort_by(.ts)|.[length-2].avg' "$HIST_FILE" 2>/dev/null || echo "null")
  ARROW="→"
  if echo "$PREV" | grep -Eq '^[0-9]+(\.[0-9]+)?$'; then
    DIFF=$(awk 'BEGIN{printf "%.2f", ('"$COV_AVG"' - '"$PREV"') }')
    awk 'BEGIN{exit !('"$DIFF"' > 0.2)}' && ARROW="↑" || true
    awk 'BEGIN{exit !('"$DIFF"' < -0.2)}' && ARROW="↓" || true
  fi
  # Color based on absolute coverage
  TREND_COLOR=red
  awk 'BEGIN{exit !('"$COV_AVG"' >= 60)}' && TREND_COLOR=orange || true
  awk 'BEGIN{exit !('"$COV_AVG"' >= 80)}' && TREND_COLOR=green || true
  awk 'BEGIN{exit !('"$COV_AVG"' >= 90)}' && TREND_COLOR=brightgreen || true
  MSG=$(awk 'BEGIN{printf "%.2f%% %s", '"$COV_AVG"', "'"$ARROW"'"}')
  echo '{"schemaVersion":1,"label":"coverage trend","message":"'"$MSG"'","color":"'"$TREND_COLOR"'"}' > badges/coverage-trend-badge.json
  cp badges/coverage-trend-badge.json badges/coverage-trend-badge-${SAFE_BRANCH}.json || true
fi

if git status --porcelain | grep -q .; then
  git config user.email "github-actions[bot]@users.noreply.github.com"
  git config user.name "github-actions[bot]"
  git add badges
  git commit -m "chore(badges): update badges for ${GITHUB_REF_NAME}" || echo "Nothing to commit"
  git fetch --depth=1 origin badges || true
  git push origin HEAD:badges || true
fi

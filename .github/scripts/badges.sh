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
if git status --porcelain | grep -q .; then
  git config user.email "github-actions[bot]@users.noreply.github.com"
  git config user.name "github-actions[bot]"
  git add badges
  git commit -m "chore(badges): update badges for ${GITHUB_REF_NAME}" || echo "Nothing to commit"
  git fetch --depth=1 origin badges || true
  git push origin HEAD:badges || true
fi

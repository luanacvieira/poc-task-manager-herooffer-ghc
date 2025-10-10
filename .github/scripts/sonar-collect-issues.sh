#!/usr/bin/env bash
set -euo pipefail
if [ "${SKIP_SONAR:-false}" = "true" ]; then
	echo "Skipping Sonar issue collection (guard)."
	exit 0
fi
DATA=$(curl -s -u "${SONAR_TOKEN}:" "https://sonarcloud.io/api/issues/search?componentKeys=${SONAR_PROJECT_KEY}&statuses=OPEN&ps=500" || echo '{}')
echo "$DATA" | jq '.' >/dev/null 2>&1 || DATA='{}'
BLOCKER=$(echo "$DATA" | jq '[.issues[]? | select(.severity=="BLOCKER")] | length')
CRITICAL=$(echo "$DATA" | jq '[.issues[]? | select(.severity=="CRITICAL")] | length')
MAJOR=$(echo "$DATA" | jq '[.issues[]? | select(.severity=="MAJOR")] | length')
MINOR=$(echo "$DATA" | jq '[.issues[]? | select(.severity=="MINOR")] | length')
echo "blocker=$BLOCKER" >> "$GITHUB_OUTPUT"
echo "critical=$CRITICAL" >> "$GITHUB_OUTPUT"
echo "major=$MAJOR" >> "$GITHUB_OUTPUT"
echo "minor=$MINOR" >> "$GITHUB_OUTPUT"
echo "Sonar severities -> BLOCKER:$BLOCKER CRITICAL:$CRITICAL MAJOR:$MAJOR MINOR:$MINOR"

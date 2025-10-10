#!/usr/bin/env bash
set -euo pipefail
REPO="${GITHUB_REPOSITORY}"
RAW=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/code-scanning/alerts?state=open&per_page=100" || echo '[]')
if ! echo "$RAW" | jq -e 'type=="array"' >/dev/null 2>&1; then RAW='[]'; fi
mkdir -p badges/history
node <<'EOF'
const fs=require('fs');
let alerts=[];try{alerts=JSON.parse(process.env.RAW||'[]');if(!Array.isArray(alerts))alerts=[];}catch{}
const sevMap={critical:0,high:0,medium:0,low:0};
for(const a of alerts){
  const sev=(a.security_severity_level||a.rule?.security_severity_level||a.rule?.severity||'').toLowerCase();
  if(sev in sevMap) sevMap[sev]++;
}
if(fs.existsSync('semgrep-artifact/semgrep.sarif')){
  try{const sar=JSON.parse(fs.readFileSync('semgrep-artifact/semgrep.sarif','utf8'));for(const run of sar.runs||[]){for(const r of run.results||[]){const s=(r.rule?.severity||'').toLowerCase(); if(s==='error') sevMap.critical++; else if(s==='warning') sevMap.high++; else if(s==='info') sevMap.medium++;}}}catch{}
}
for(const k of Object.keys(sevMap)) process.stdout.write(`${k.toUpperCase()}=${sevMap[k]}\n`);
fs.writeFileSync('badges/history/raw-code-scanning-alerts.json',JSON.stringify(alerts,null,2));
if(process.env.GITHUB_ENV){for(const [k,v] of Object.entries(sevMap)) fs.appendFileSync(process.env.GITHUB_ENV, `${k.toUpperCase()}_COUNT=${v}\n`);} 
EOF
export CODE_SCANNING_JSON="$RAW"
export CRIT=${CRITICAL:-${CRIT:-0}}
export HIGH=${HIGH:-${HIGH_COUNT:-0}}
export MED=${MED:-${MED_COUNT:-0}}
export LOW=${LOW:-0}
export NOW_TS=$(date +%s)
export CATALOG=badges/history/alerts-catalog.json
node .github/scripts/collect-security-signals.js || echo "(Warn) collect-security-signals fallback"
echo "CRIT_COUNT=$CRIT" >> $GITHUB_ENV
echo "HIGH_COUNT=$HIGH" >> $GITHUB_ENV
echo "MED_COUNT=$MED" >> $GITHUB_ENV
echo "LOW_COUNT=$LOW" >> $GITHUB_ENV
echo "Security signals collected (C=$CRIT H=$HIGH M=$MED L=$LOW)"

#!/usr/bin/env bash
set -euo pipefail
npm install -g license-checker@25.0.1
license-checker --production --json > licenses.json || echo '{}' > licenses.json
node <<'EOF'
const fs=require('fs');
const allowed=new Set(['MIT','ISC','Apache-2.0','BSD-2-Clause','BSD-3-Clause']);
let data={};try{data=JSON.parse(fs.readFileSync('licenses.json','utf8'));}catch{}
let total=0, issues=0, details=[];
for(const [pkg,info] of Object.entries(data)){
  total++;
  const lic=(info.licenses||'').split(/\sOR\s|\s\|\s|,/)[0];
  if(!allowed.has(lic)){ issues++; details.push({pkg,license:lic}); }
}
fs.writeFileSync('license-signals.json',JSON.stringify({total,issues,details:details.slice(0,50)},null,2));
console.log('License scan done total=%d issues=%d', total, issues);
EOF

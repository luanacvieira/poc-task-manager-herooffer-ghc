#!/usr/bin/env bash
set -euo pipefail
# Backend SBOM
(
  cd backend
  (npm ci || npm install --legacy-peer-deps)
  npx @cyclonedx/cyclonedx-npm --json --output ../sbom-backend.json || npx cyclonedx-npm --json --output ../sbom-backend.json || echo "(fallback)"
)
# Frontend SBOM
(
  cd frontend
  (npm ci || npm install --legacy-peer-deps)
  npx @cyclonedx/cyclonedx-npm --json --output ../sbom-frontend.json || npx cyclonedx-npm --json --output ../sbom-frontend.json || echo "(fallback)"
)
mkdir -p sbom
mv sbom-backend.json sbom/backend.json 2>/dev/null || true
mv sbom-frontend.json sbom/frontend.json 2>/dev/null || true
BACK_OK=false; FRONT_OK=false
[ -f sbom/backend.json ] && BACK_OK=true
[ -f sbom/frontend.json ] && FRONT_OK=true
if $BACK_OK && $FRONT_OK; then
  node -e "const fs=require('fs');const back=JSON.parse(fs.readFileSync('sbom/backend.json','utf8'));const front=JSON.parse(fs.readFileSync('sbom/frontend.json','utf8'));const combined={bomFormat:'CycloneDX',specVersion:back.specVersion||front.specVersion||'1.5',version:1,metadata:{tools:[...(back.metadata?.tools||[]),...(front.metadata?.tools||[])]},components:[...(back.components||[]),...(front.components||[])]};fs.writeFileSync('sbom/combined.json',JSON.stringify(combined,null,2));console.log('Combined SBOM written to sbom/combined.json');"
elif $BACK_OK && ! $FRONT_OK; then
  cp sbom/backend.json sbom/combined.json
elif $FRONT_OK && ! $BACK_OK; then
  cp sbom/frontend.json sbom/combined.json
else
  echo '{"bomFormat":"CycloneDX","specVersion":"1.5","version":1,"metadata":{"tools":[]},"components":[]}' > sbom/combined.json
fi
echo "SBOM files:" > sbom/index.txt
ls -1 sbom >> sbom/index.txt || true
ls -l sbom

#!/usr/bin/env bash
set -euo pipefail
echo "== FRONTEND CLEAN REINSTALL (build stage) =="
rm -rf node_modules package-lock.json || true
npm ci || npm install
echo "schema-utils version:"; node -e "try{console.log(require('schema-utils/package.json').version)}catch(e){console.log('not found')}"
if npm run | grep -q build; then npm run build; else echo "(no build script)"; fi

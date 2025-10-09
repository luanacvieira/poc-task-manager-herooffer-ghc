#!/usr/bin/env bash
set -euxo pipefail
echo "Initial Node: $(node -v)  NPM: $(npm -v)"
echo "Upgrading npm (latest) to mitigate legacy peer & installer glitches" || true
npm install -g npm@latest || echo "(warn) npm global upgrade failed, continuing with existing version"
echo "After upgrade NPM: $(npm -v)"
rm -rf node_modules backend/node_modules frontend/node_modules || true
rm -f package-lock.json backend/package-lock.json frontend/package-lock.json || true
npm install --legacy-peer-deps
npm install --workspaces --legacy-peer-deps

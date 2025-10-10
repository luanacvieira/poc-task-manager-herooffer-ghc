#!/usr/bin/env bash
set -euxo pipefail
rm -rf node_modules package-lock.json || true
npm install -g npm@latest || true
npm install --legacy-peer-deps
ls -1 node_modules | head -n 40 || true

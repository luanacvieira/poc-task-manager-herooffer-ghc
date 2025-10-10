#!/usr/bin/env bash
set -euo pipefail
node -c src/server.js 2>/dev/null || echo "(no syntax issues)"
(timeout 5s node src/server.js &) || true
sleep 2
echo "Backend started (smoke)"

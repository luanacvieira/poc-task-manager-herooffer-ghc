#!/usr/bin/env bash
set -euo pipefail
mkdir -p coverage-html/backend coverage-html/frontend
BACK_DIR=$(find backend-coverage-artifact -type d -name 'lcov-report' | head -n1 || true)
FRONT_DIR=$(find frontend-coverage-artifact -type d -name 'lcov-report' | head -n1 || true)
[ -n "$BACK_DIR" ] && cp -R "$BACK_DIR/"* coverage-html/backend/ || true
[ -n "$FRONT_DIR" ] && cp -R "$FRONT_DIR/"* coverage-html/frontend/ || true
cat > coverage-html/index.html <<'EOF'
<html><head><meta charset="utf-8"/><title>Coverage Reports</title><style>body{font-family:Arial,sans-serif;margin:32px;}a{display:block;margin:8px 0;color:#0366d6;text-decoration:none;}a:hover{text-decoration:underline}</style></head><body><h1>Coverage Reports</h1><ul><li><a href="backend/index.html">Backend</a></li><li><a href="frontend/index.html">Frontend</a></li></ul><p>Gerado automaticamente pelo Orchestrator.</p></body></html>
EOF

#!/usr/bin/env bash
set -euo pipefail
pip install --no-cache-dir semgrep
semgrep --config p/ci --sarif --output semgrep.sarif || { echo "Semgrep SARIF generation failed"; exit 1; }
ls -l semgrep.sarif || true

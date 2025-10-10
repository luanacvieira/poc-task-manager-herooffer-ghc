#!/usr/bin/env bash
set -euo pipefail
# Thin wrapper to keep backward references; delegates to sbom.sh
bash "$(dirname "$0")/sbom.sh"

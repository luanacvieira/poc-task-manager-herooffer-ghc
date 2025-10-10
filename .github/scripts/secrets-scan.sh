#!/usr/bin/env bash
set -euo pipefail
GL_VERSION=${GL_VERSION:-v8.18.4}
ARCHIVE="gitleaks_${GL_VERSION#v}_linux_x64.tar.gz"
URL="https://github.com/gitleaks/gitleaks/releases/download/${GL_VERSION}/${ARCHIVE}"
echo "Installing gitleaks $GL_VERSION" || true
if curl -sSfL "$URL" -o /tmp/gitleaks.tgz; then
  tar -xzf /tmp/gitleaks.tgz -C /tmp gitleaks || true
  sudo mv /tmp/gitleaks /usr/local/bin/gitleaks || true
fi
if ! command -v gitleaks >/dev/null 2>&1; then
  echo '::warning::gitleaks not installed; creating empty SARIF'
  echo '{"version":"2.1.0","$schema":"https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json","runs":[]}' > gitleaks.sarif
else
  echo 'Running gitleaks (non-blocking)'
  gitleaks detect --report-format sarif --report-path gitleaks.sarif --exit-code 0 || echo 'gitleaks returned non-zero'
fi
node <<'EOF'
const fs=require('fs');
let c=0;try{const sar=JSON.parse(fs.readFileSync('gitleaks.sarif','utf8'));for(const run of sar.runs||[]) c+=(run.results||[]).length;}catch{}
fs.writeFileSync('secret-signals.json',JSON.stringify({count:c,tool:'gitleaks'},null,2));
console.log('Detected secrets:',c);
EOF

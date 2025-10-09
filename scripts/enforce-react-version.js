#!/usr/bin/env node
/**
 * Ensures only the approved React / ReactDOM versions are installed.
 * If mismatches are found, it exits with non-zero to force reinstall respecting overrides.
 */
const fs = require('fs');
const path = require('path');

const allowed = '18.2.0';
const pkgs = ['react', 'react-dom'];
let problems = [];
for (const p of pkgs) {
  try {
    const pkgPath = require.resolve(path.join(p, 'package.json'));
    const data = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (data.version !== allowed) {
      problems.push(`${p}@${data.version}`);
    }
  } catch (e) {
    // ignore if not yet installed
  }
}
if (problems.length) {
  console.error(`\n[enforce-react-version] Detected mismatched versions: ${problems.join(', ')} (expected ${allowed}).`);
  console.error('Aborting install so overrides can be applied or cache cleared.');
  process.exit(1);
} else {
  console.log(`[enforce-react-version] React versions OK (${allowed}).`);
}

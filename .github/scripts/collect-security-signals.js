#!/usr/bin/env node
/*
  Collect security signals: code scanning (CodeQL + Semgrep), Semgrep SARIF fallback, Gitleaks, aging, catalog, and badges.
*/
const fs = require('fs');
const path = require('path');

function safeJsonParse(str, fallback){
  try { return JSON.parse(str); } catch { return fallback; }
}

const now = parseInt(process.env.NOW_TS,10) || Math.floor(Date.now()/1000);
const catalogFile = process.env.CATALOG || 'badges/history/alerts-catalog.json';
let catalog = {};
try { catalog = JSON.parse(fs.readFileSync(catalogFile,'utf8')); } catch {}

const currentIds = new Set();
function add(id, source){
  if(!id) return;
  if(!catalog[id]) catalog[id] = { firstSeen: now, reopenCount: 0 };
  catalog[id].lastSeen = now;
  if(catalog[id].closedAt){
    catalog[id].reopenCount = (catalog[id].reopenCount||0)+1;
    delete catalog[id].closedAt;
  }
  catalog[id].status='open';
  catalog[id].source=source;
  currentIds.add(id);
}

// Code scanning alerts (already merged from CodeQL + Semgrep uploads by GitHub)
const codeScanningAlerts = safeJsonParse(process.env.CODE_SCANNING_JSON || '[]', []);
for(const a of codeScanningAlerts){
  add(`cs:${a.number || a.rule?.id || 'unknown'}`,'code-scanning');
}

// Semgrep SARIF (granular) for additional identifiers
try {
  if(fs.existsSync('semgrep-artifact/semgrep.sarif')){
    const sarif = JSON.parse(fs.readFileSync('semgrep-artifact/semgrep.sarif','utf8'));
    for(const run of sarif.runs||[]){
      for(const r of run.results||[]){
        const ruleId = r.ruleId || r.rule?.id || 'rule';
        const loc = r.locations?.[0]?.physicalLocation || {};
        const file = loc.artifactLocation?.uri || 'unknown';
        const line = loc.region?.startLine || 0;
        add(`sg:${ruleId}:${file}:${line}`,'semgrep');
      }
    }
  }
} catch(e) {
  console.warn('Semgrep SARIF parse warning:', e.message);
}

// Gitleaks SARIF
try {
  if(fs.existsSync('gitleaks-artifact/gitleaks.sarif')){
    const sarif = JSON.parse(fs.readFileSync('gitleaks-artifact/gitleaks.sarif','utf8'));
    for(const run of sarif.runs||[]){
      for(const r of run.results||[]){
        const msg = (r.message && r.message.text) || 'secret';
        const rule = r.ruleId || 'secret';
        add(`gl:${rule}:${msg.substring(0,40)}`,'gitleaks');
      }
    }
  }
} catch(e) {
  console.warn('Gitleaks SARIF parse warning:', e.message);
}

// Close disappeared alerts
for(const id of Object.keys(catalog)){
  if(catalog[id].status !== 'closed' && !currentIds.has(id)){
    catalog[id].status='closed';
    if(!catalog[id].closedAt) catalog[id].closedAt = now;
  }
}

// Aging calculation (open alerts only)
let ages = [];
for(const id of currentIds){
  const meta = catalog[id];
  if(meta?.firstSeen) ages.push((now - meta.firstSeen)/86400);
}
const agingDays = ages.length ? (ages.reduce((a,b)=>a+b,0)/ages.length) : 0;

// Persist catalog
try { fs.mkdirSync(path.dirname(catalogFile), { recursive: true }); } catch {}
try { fs.writeFileSync(catalogFile, JSON.stringify(catalog,null,2)); } catch(e) { console.warn('Catalog write warning:', e.message); }

// Summary counts from environment (already consolidated severity tallies)
const summary = {
  critical: parseInt(process.env.CRIT,10) || 0,
  high: parseInt(process.env.HIGH,10) || 0,
  medium: parseInt(process.env.MED,10) || 0,
  low: parseInt(process.env.LOW,10) || 0,
  agingDays: parseFloat(agingDays.toFixed(2))
};

try { fs.mkdirSync('badges', { recursive: true }); } catch {}
try { fs.writeFileSync('badges/security-signals.json', JSON.stringify(summary,null,2)); } catch(e){ console.warn('security-signals.json write warning:', e.message); }

const total = summary.critical + summary.high + summary.medium;
let color = 'brightgreen';
if(summary.critical>0) color='red'; else if(summary.high>0) color='orange'; else if(summary.medium>0) color='yellow';
try {
  fs.writeFileSync('badges/security-signals-badge.json', JSON.stringify({
    schemaVersion:1,
    label:'security alerts',
    message:`${total} (C${summary.critical}/H${summary.high}/M${summary.medium})`,
    color
  },null,2));
} catch(e){ console.warn('security-signals-badge.json write warning:', e.message); }

// Append AGING_DAYS to GitHub env file
try {
  if(process.env.GITHUB_ENV){
    fs.appendFileSync(process.env.GITHUB_ENV, `AGING_DAYS=${summary.agingDays}\n`);
  }
} catch(e){ console.warn('GITHUB_ENV append warning:', e.message); }

console.log('Security signals summary:', summary);

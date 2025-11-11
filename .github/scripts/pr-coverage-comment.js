#!/usr/bin/env node
/* Replaces inline github-script for PR coverage delta */
const fetchFn = global.fetch || ((...a)=>import('node-fetch').then(m=>m.default(...a)));
const core = process.env; // environment supplies variables
function safeNumber(v){ const n=parseFloat(v); return Number.isFinite(n)? n : null; }
const currentNum = safeNumber(core.CURRENT_AVG);
const baseRef = core.BASE_REF || 'master';
const repoFull = core.REPO_FULL;
const safeBase = baseRef.replace(/[\\/]/g,'-').toLowerCase();
async function getBaseCoverage(){
  if(!repoFull) return null;
  const url = `https://raw.githubusercontent.com/${repoFull}/badges/badges/coverage-badge-${safeBase}.json`;
  try { const r = await fetchFn(url); if(r.ok){ const j= await r.json(); return safeNumber(String(j.message||'').replace('%','')); } } catch(e) {}
  return null;
}
(async()=>{
  const baseVal = await getBaseCoverage();
  let deltaVal=null, symbol='';
  if(currentNum!=null && baseVal!=null){ deltaVal=currentNum-baseVal; symbol = deltaVal>0?'↑': deltaVal<0?'↓':'='; }
  const gateStatus=(core.GATE_STATUS||'').trim()||'unknown';
  const currentDisplay = currentNum!=null? currentNum.toFixed(2)+'%' : 'unavailable';
  const baseDisplay = baseVal!=null? baseVal.toFixed(2)+'%' : 'unavailable';
  const deltaDisplay = deltaVal==null? 'n/a': `${symbol} ${deltaVal.toFixed(2)}%`;
  const diffPctRaw = safeNumber(core.DIFF_PCT);
  const diffPctDisplay = diffPctRaw!=null? diffPctRaw.toFixed(2)+'%' : 'n/a';
  const diffPassDisplay = diffPctRaw==null? 'n/a' : ((core.DIFF_PASS||'')==='true'? 'pass':'fail');
  const body = `<!-- coverage-delta -->\n### Coverage Delta\nCurrent (PR): **${currentDisplay}**\nBase (${baseRef}): **${baseDisplay}**\nDelta: **${deltaDisplay}**\nGate (>=80%): **${gateStatus}**\nDiff Coverage (>=80%): **${diffPctDisplay} (${diffPassDisplay})**`;
  // Write body to file; workflow can use gh cli or github-script minimal wrapper to post
  require('fs').writeFileSync('pr-comment-body.txt', body);
  console.log('PR coverage comment body written to pr-comment-body.txt');
})();

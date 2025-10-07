#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '';
const [owner, repo] = REPO.split('/');
const token = process.env.GITHUB_TOKEN;
if (!token) { console.error('GITHUB_TOKEN ausente; abortando.'); process.exit(0);} 
async function ghJson(url){ const res=await fetch(url,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json'}}); if(!res.ok){ console.warn('Falha fetch',url,res.status); return null;} return res.json(); }
function readJsonSafe(p,def=null){ try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return def;} }
function history(baseDir, name, branch){ return readJsonSafe(path.join(baseDir,'badges','history',`${name}-${branch}.json`),[]);} 
function latest(list, key){ return list.length? parseFloat(list[list.length-1][key]) : null; }
function durationStats(msList){ if(!msList.length) return {avgSec:0,p95Sec:0,count:0}; const secs=msList.map(x=>x/1000).sort((a,b)=>a-b); const avg=secs.reduce((a,b)=>a+b,0)/secs.length; const p95=secs[Math.min(secs.length-1, Math.floor(secs.length*0.95))]; return {avgSec:+avg.toFixed(2),p95Sec:+p95.toFixed(2),count:secs.length}; }
(async()=>{
  const badgesDir = fs.existsSync('_badges_worktree') ? '_badges_worktree' : '.';
  let refBranch='master';
  let coverageHist = history(badgesDir,'coverage-history','master');
  if(!coverageHist.length){ const alt = history(badgesDir,'coverage-history','develop'); if(alt.length){ coverageHist=alt; refBranch='develop'; } }
  const diffHist = history(badgesDir,'diff-coverage-history',refBranch);
  const alerts = await ghJson(`https://api.github.com/repos/${owner}/${repo}/code-scanning/alerts?state=open&per_page=100`) || [];
  const sev = {critical:0,high:0,medium:0,low:0,note:0,unknown:0};
  for(const a of alerts){ const s=(a.rule?.security_severity||a.rule?.severity||'unknown').toLowerCase(); if(sev[s]!==undefined) sev[s]++; else sev.unknown++; }
  const workflows = await ghJson(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`);
  const orchestratorId = workflows?.workflows?.find(w=>w.name==='Orchestrator Pipeline')?.id;
  let perf={avgSec:0,p95Sec:0,count:0};
  if(orchestratorId){ const runs = await ghJson(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${orchestratorId}/runs?per_page=20`); const durations = (runs?.workflow_runs||[]).filter(r=>r.status==='completed').map(r=> new Date(r.updated_at)-new Date(r.run_started_at)); perf=durationStats(durations); }
  const covAvg = latest(coverageHist,'avg')||0; const diffLatest = latest(diffHist,'pct');
  const risk = ((sev.critical+sev.high)*2) + ((100-covAvg)/10);
  const metrics = { repository: REPO, referenceBranch: refBranch, timestamps:{generated:new Date().toISOString()}, coverage:{historyPoints:coverageHist.length, latestAverage:covAvg, trendDirection: coverageHist.length>1? covAvg - parseFloat(coverageHist[Math.max(0,coverageHist.length-2)].avg):0, differentialLatest: diffLatest!=null? parseFloat(diffLatest):null}, security:{totalOpenAlerts:alerts.length, severityCount:sev}, workflowPerformance:perf, compositeRiskIndex:+risk.toFixed(2)};
  fs.mkdirSync('analytics',{recursive:true});
  fs.writeFileSync('analytics/metrics.json', JSON.stringify(metrics,null,2));
  const dashDir = path.join(process.env.DASHBOARD_DIR||'docs/analytics-dashboard'); fs.mkdirSync(dashDir,{recursive:true});
  const html = `<!DOCTYPE html><html lang="pt-br"><head><meta charset=\"UTF-8\"/><title>Dashboard Analítico – ${repo}</title><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/><style>body{font-family:system-ui,Arial,sans-serif;margin:20px;color:#222;}h1{margin-top:0}section{margin-bottom:32px}.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:16px 0}.kpi{border:1px solid #ddd;padding:12px;border-radius:8px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05)}.kpi h3{margin:0 0 4px;font-size:14px;text-transform:uppercase;color:#555}.kpi .val{font-size:24px;font-weight:600}.trendUp{color:#0a0}.trendDown{color:#c00}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#fafafa}</style><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script></head><body><h1>Dashboard Analítico – ${repo}</h1><p>Branch referência cobertura: <strong>${metrics.referenceBranch}</strong></p><section><h2>KPIs</h2><div class="kpi-grid"><div class="kpi"><h3>Coverage Média</h3><div class="val">${covAvg.toFixed(2)}%</div></div><div class="kpi"><h3>Delta Último Ponto</h3><div class="val ${(metrics.coverage.trendDirection||0)>=0?'trendUp':'trendDown'}">${metrics.coverage.trendDirection>=0?'+':''}${metrics.coverage.trendDirection.toFixed(2)}%</div></div><div class="kpi"><h3>Diff Coverage</h3><div class="val">${diffLatest!=null?parseFloat(diffLatest).toFixed(2)+'%':'n/a'}</div></div><div class="kpi"><h3>Alertas Abertos</h3><div class="val">${alerts.length}</div></div><div class="kpi"><h3>Duração Média</h3><div class="val">${perf.avgSec}s</div></div><div class="kpi"><h3>p95</h3><div class="val">${perf.p95Sec}s</div></div><div class="kpi"><h3>Índice Risco</h3><div class="val">${metrics.compositeRiskIndex}</div></div></div></section><section><h2>Severidade</h2><table><thead><tr><th>Severidade</th><th>Qtd</th></tr></thead><tbody>${Object.entries(sev).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</tbody></table></section><section><h2>Histórico Cobertura</h2><canvas id="cvg" height="120"></canvas></section><script>const h=${JSON.stringify(coverageHist)};if(h.length){const l=h.map(p=>new Date(p.t*1000).toLocaleDateString()),d=h.map(p=>parseFloat(p.avg));new Chart(document.getElementById('cvg'),{type:'line',data:{labels:l,datasets:[{label:'Coverage %',data:d,borderColor:'#2563eb',backgroundColor:'rgba(37,99,235,0.15)',tension:.25,fill:true}]},options:{scales:{y:{beginAtZero:true,suggestedMax:100}}}});} </script></body></html>`;
  fs.writeFileSync(path.join(dashDir,'index.html'), html);
  console.log('Dashboard gerado.');
})();

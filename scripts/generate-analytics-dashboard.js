#!/usr/bin/env node
/*
  Gera consolidação de métricas: cobertura (histórico), vulnerabilidades (Code Scanning), performance (duração média de workflow), índice de risco simplificado.
  Saídas:
    - analytics/metrics.json
    - docs/analytics-dashboard/index.html (auto-gerado se existir diretório docs)
*/
const fs = require('fs');
const path = require('path');

// ----------------- Helpers -----------------
const REPO = process.env.REPO || '';
const [owner, repo] = REPO.split('/');
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN ausente; abortando geração analítica.');
  process.exit(0);
}

async function ghJson(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } });
  if (!res.ok) {
    console.warn('Falha fetch', url, res.status);
    return null;
  }
  return res.json();
}

function readJsonSafe(p, def = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return def; }
}

function pickCoverageHistory(baseDir, branch) {
  const file = path.join(baseDir, 'badges', 'history', `coverage-history-${branch}.json`);
  return readJsonSafe(file, []);
}

function pickDiffCoverageHistory(baseDir, branch) {
  const file = path.join(baseDir, 'badges', 'history', `diff-coverage-history-${branch}.json`);
  return readJsonSafe(file, []);
}

function latestAvg(hist) { return hist.length ? parseFloat(hist[hist.length - 1].avg) : null; }
function latestDiff(hist) { return hist.length ? parseFloat(hist[hist.length - 1].pct) : null; }

function durationStats(list) {
  if (!list.length) return { avgSec: 0, p95Sec: 0, count: 0 };
  const secs = list.map(x => x / 1000).sort((a,b)=>a-b);
  const avg = secs.reduce((a,b)=>a+b,0)/secs.length;
  const p95 = secs[Math.min(secs.length - 1, Math.floor(secs.length * 0.95))];
  return { avgSec: +avg.toFixed(2), p95Sec: +p95.toFixed(2), count: secs.length };
}

// ----------------- Main -----------------
(async () => {
  const badgesWorktree = fs.existsSync('_badges_worktree') ? '_badges_worktree' : '.'; // fallback
  const candidateBranches = ['master', 'develop'];
  let chosen = null; let coverageHist = []; let diffHist = [];
  for (const b of candidateBranches) {
    coverageHist = pickCoverageHistory(badgesWorktree, b);
    if (coverageHist.length) { chosen = b; diffHist = pickDiffCoverageHistory(badgesWorktree, b); break; }
  }
  if (!chosen) { chosen = 'master'; }

  // Code Scanning alerts (open)
  const alerts = await ghJson(`https://api.github.com/repos/${owner}/${repo}/code-scanning/alerts?state=open&per_page=100`)
                 || [];
  const severityCount = { critical:0, high:0, medium:0, low:0, note:0, unknown:0 };
  alerts.forEach(a => { const s=(a.rule?.security_severity||a.rule?.severity||'unknown').toLowerCase(); if(severityCount[s]!==undefined) severityCount[s]++; else severityCount.unknown++; });
  const totalAlerts = alerts.length;

  // Workflow performance (últimos 20 runs do orchestrator)
  // Descobrindo workflow id por nome
  const workflows = await ghJson(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`);
  let orchestratorId = workflows?.workflows?.find(w => w.name === 'Orchestrator Pipeline')?.id;
  let runDurations = [];
  if (orchestratorId) {
    const runs = await ghJson(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${orchestratorId}/runs?per_page=20`);
    if (runs?.workflow_runs) {
      runDurations = runs.workflow_runs.filter(r=>r.status==='completed' && r.run_started_at && r.updated_at).map(r=> (new Date(r.updated_at) - new Date(r.run_started_at)) );
    }
  }
  const perf = durationStats(runDurations);

  // Risco simplificado: (alertas críticos+altos) * 2 + (100 - coberturaAtual)/10
  const covCurrent = latestAvg(coverageHist) ?? 0;
  const diffCurrent = latestDiff(diffHist) ?? null;
  const riskScore = ((severityCount.critical + severityCount.high) * 2) + ((100 - covCurrent) / 10);

  const metrics = {
    repository: REPO,
    referenceBranch: chosen,
    timestamps: { generated: new Date().toISOString() },
    coverage: {
      historyPoints: coverageHist.length,
      latestAverage: covCurrent,
      trendDirection: coverageHist.length > 1 ? (covCurrent - parseFloat(coverageHist[Math.max(0, coverageHist.length-2)].avg)) : 0,
      differentialLatest: diffCurrent
    },
    security: {
      totalOpenAlerts: totalAlerts,
      severityCount
    },
    workflowPerformance: perf,
    compositeRiskIndex: +riskScore.toFixed(2)
  };

  fs.mkdirSync('analytics', { recursive: true });
  fs.writeFileSync('analytics/metrics.json', JSON.stringify(metrics, null, 2));

  // HTML Dashboard
  const dashDir = path.join(process.env.DASHBOARD_DIR || 'docs/analytics-dashboard');
  fs.mkdirSync(dashDir, { recursive: true });
  const html = `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"/><title>Dashboard Analítico – ${repo}</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>body{font-family:system-ui,Arial,sans-serif;margin:20px;color:#222;}h1{margin-top:0}section{margin-bottom:32px}code{background:#f5f5f5;padding:2px 4px;border-radius:4px;font-size:0.9em} .kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:16px 0;} .kpi{border:1px solid #ddd;padding:12px;border-radius:8px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05);} .kpi h3{margin:0 0 4px;font-size:14px;text-transform:uppercase;color:#555;} .kpi .val{font-size:24px;font-weight:600;} .trendUp{color:#0a0;} .trendDown{color:#c00;} canvas{max-width:100%;} footer{margin-top:40px;font-size:12px;color:#666;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:6px;text-align:left;} th{background:#fafafa;} .sev-critical{color:#b30000;font-weight:600;} .sev-high{color:#d32;} .sev-medium{color:#c60;} .sev-low{color:#06c;} .sev-note{color:#555;} .badge{display:inline-block;padding:2px 6px;border-radius:4px;font-size:12px;background:#eee;margin-right:4px;} </style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" integrity="sha256-VnoxJqGQvYVz45hD9KsGJ6JrXmefNJmkavRKu0kUQws=" crossorigin="anonymous"></script>
</head><body>
<h1>Dashboard Analítico – ${repo}</h1>
<p>Branch de referência de cobertura: <strong>${metrics.referenceBranch}</strong></p>

<section>
  <h2>KPIs Principais</h2>
  <div class="kpi-grid">
    <div class="kpi"><h3>Coverage Média</h3><div class="val">${metrics.coverage.latestAverage?.toFixed(2) || 'n/a'}%</div></div>
    <div class="kpi"><h3>Delta Último Ponto</h3><div class="val ${(metrics.coverage.trendDirection||0) >= 0 ? 'trendUp':'trendDown'}">${metrics.coverage.trendDirection>=0?'+':''}${metrics.coverage.trendDirection.toFixed(2)}%</div></div>
    <div class="kpi"><h3>Diff Coverage (Último)</h3><div class="val">${metrics.coverage.differentialLatest!=null? metrics.coverage.differentialLatest.toFixed(2)+'%':'n/a'}</div></div>
    <div class="kpi"><h3>Alertas de Segurança Abertos</h3><div class="val">${metrics.security.totalOpenAlerts}</div></div>
    <div class="kpi"><h3>Duração Média Pipeline</h3><div class="val">${metrics.workflowPerformance.avgSec}s</div></div>
    <div class="kpi"><h3>p95 Duração</h3><div class="val">${metrics.workflowPerformance.p95Sec}s</div></div>
    <div class="kpi"><h3>Índice Composto de Risco</h3><div class="val">${metrics.compositeRiskIndex}</div></div>
  </div>
</section>

<section>
  <h2>Distribuição de Severidade (Alertas Abertos)</h2>
  <table><thead><tr><th>Severidade</th><th>Quantidade</th></tr></thead><tbody>
    ${Object.entries(metrics.security.severityCount).map(([k,v])=>`<tr><td class="sev-${k}">${k}</td><td>${v}</td></tr>`).join('')}
  </tbody></table>
</section>

<section>
  <h2>Histórico de Cobertura</h2>
  <canvas id="coverageChart" height="120"></canvas>
</section>

<section>
  <h2>Fonte de Dados</h2>
  <ul>
    <li>Histórico: branch <code>badges</code> (arquivos JSON em <code>badges/history</code>).</li>
    <li>Alertas: API Code Scanning (open state).</li>
    <li>Performance: Últimos ${metrics.workflowPerformance.count} runs do workflow "Orchestrator Pipeline".</li>
  </ul>
</section>

<footer>Gerado em ${metrics.timestamps.generated} • Atualize o pipeline para números mais recentes.</footer>
<script>
  const coverageHist = ${JSON.stringify(coverageHist)};
  const labels = coverageHist.map(p=> new Date(p.t*1000).toLocaleDateString());
  const data = coverageHist.map(p=> parseFloat(p.avg));
  if (coverageHist.length) {
    new Chart(document.getElementById('coverageChart'), {
      type: 'line', data: { labels, datasets: [{ label: 'Coverage %', data, borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,0.1)', tension:.25, fill:true }]},
      options: { scales: { y: { beginAtZero:true, suggestedMax:100 } }, plugins:{legend:{display:true}} }
    });
  }
</script>
</body></html>`;
  fs.writeFileSync(path.join(dashDir, 'index.html'), html);
  console.log('Dashboard analítico gerado com sucesso.');
})();

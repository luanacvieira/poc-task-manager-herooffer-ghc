const fs = require('fs');
const [backend, frontend] = process.argv.slice(2);
if(!backend || !frontend) { console.error('usage: node combine-coverage.js <backend-summary.json> <frontend-summary.json>'); process.exit(1); }
const b = JSON.parse(fs.readFileSync(backend,'utf8'));
const f = JSON.parse(fs.readFileSync(frontend,'utf8'));
function merge(a,b){ const at=Number(a.total)||0, bt=Number(b.total)||0, ac=Number(a.covered)||0, bc=Number(b.covered)||0; return { total: at+bt, covered: ac+bc }; }
const metrics = Object.keys(b.total);
const result={ total:{} };
for(const m of metrics){
  const merged=merge(b.total[m], f.total[m]);
  const pct = merged.total ? (merged.covered/merged.total*100) : 100;
  merged.pct = pct.toFixed(2);
  result.total[m]=merged;
}
const thresholds={ lines:80, statements:80, functions:80, branches:80 };
const fails=Object.entries(thresholds).filter(([k,v])=> parseFloat(result.total[k].pct) < v).map(([k])=>k+':'+result.total[k].pct);
const avg=(Object.values(result.total).reduce((a,x)=>a+parseFloat(x.pct),0)/metrics.length).toFixed(2);
fs.mkdirSync('combined-coverage',{recursive:true});
const avgColor = parseFloat(avg)>=90?'brightgreen':parseFloat(avg)>=80?'green':parseFloat(avg)>=60?'orange':'red';
fs.writeFileSync('combined-coverage/coverage-badge.json', JSON.stringify({schemaVersion:1,label:'coverage (combined)',message:avg+'%',color: avgColor}));
const gatePass = fails.length === 0;
fs.writeFileSync('combined-coverage/coverage-gate-badge.json', JSON.stringify({schemaVersion:1,label:'coverage gate',message: gatePass? 'pass':'fail',color: gatePass? 'green':'red'}));
fs.writeFileSync('combined-coverage/coverage-metrics.json', JSON.stringify({ avg, metrics: result.total, pass: gatePass, fails }, null, 2));
if(fails.length){ console.error('Coverage gate fail:', fails.join(',')); process.exit(1); }

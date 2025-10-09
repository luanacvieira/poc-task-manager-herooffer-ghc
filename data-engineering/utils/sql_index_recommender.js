/**
 * Heuristic SQL index & rewrite recommender (demo)
 * - Não executa plano real: usa regex + padrões comuns
 * - Objetivo: mostrar como Copilot/GHAS podem antecipar otimizações
 */
const fs = require('fs');

function parseSQL(sql){
  return sql.replace(/--.*$/mg,'').trim();
}

function extractWhereClauses(sql){
  const m = sql.match(/where([\s\S]*?)(order by|group by|limit|$)/i);
  return m? m[1] : '';
}

function extractOrderBy(sql){
  const m = sql.match(/order\s+by\s+([\w.,\s]+)/i); return m? m[1].trim():'';
}

function findColumns(pattern, text){
  const r = new RegExp(pattern,'ig');
  const cols = new Set();
  let m; while((m=r.exec(text))){ cols.add(m[1]); }
  return [...cols];
}

function recommend(sql){
  const clean = parseSQL(sql);
  const where = extractWhereClauses(clean);
  const order = extractOrderBy(clean);
  const recs = [];

  // 1. SELECT * warning
  if(/select\s+\*/i.test(clean)){
    recs.push({ type:'projection', message:'Evitar SELECT * — projetar apenas colunas necessárias reduz I/O.' });
  }
  // 2. BETWEEN date range => sugere índice
  if(/between\s+'\d{4}-\d{2}-\d{2}'\s+and\s+'\d{4}-\d{2}-\d{2}'/i.test(where)){
    recs.push({ type:'index', message:'Adicionar índice em (createdAt) ou (createdAt, priority) para acelerar range scan.' });
  }
  // 3. IN list
  if(/\bpriority\s+in\s*\(/i.test(where)){
    recs.push({ type:'index', message:'Índice em (priority) ou índice composto (priority, createdAt) pode ajudar filtro + ordenação.' });
  }
  // 4. Correlated subquery COUNT(*) pattern
  if(/select\s+count\(\*\).*from\s+\w+\s+\w+2?/i.test(clean) && /where[\s\S]*\b\w+2?\.priority\s*=\s*\w+\.priority/i.test(clean)){
    recs.push({ type:'rewrite', message:'Subquery correlacionada detectada — considerar reescrever com JOIN + GROUP BY.' });
  }
  // 5. ORDER BY sem índice
  if(order){
    recs.push({ type:'index', message:`Verificar índice cobrindo a coluna de ORDER BY: (${order.split(',')[0].trim()}).` });
  }
  // 6. LIMIT + ORDER BY => tip
  if(/order\s+by/i.test(clean) && /limit\s+\d+/i.test(clean)){
    recs.push({ type:'perf', message:'LIMIT após ORDER BY — índice adequado pode evitar sort completo.' });
  }
  // 7. Anti-pattern COUNT(*) > 0
  if(/count\(\*\)\)\s*>\s*0/i.test(clean)){
    recs.push({ type:'rewrite', message:'Use EXISTS ao invés de COUNT(*) > 0 para short-circuit.' });
  }
  return recs;
}

function format(recs){
  if(!recs.length) return 'Nenhuma recomendação heurística encontrada.';
  return recs.map((r,i)=>`[${i+1}] (${r.type}) ${r.message}`).join('\n');
}

if(require.main === module){
  const path = process.argv[2];
  if(!path){
    console.error('Uso: node sql_index_recommender.js <arquivo.sql>');
    process.exit(1);
  }
  const sql = fs.readFileSync(path,'utf8');
  const recs = recommend(sql);
  console.log('=== SQL Analisada ===');
  console.log(sql.trim());
  console.log('\n=== Recomendações ===');
  console.log(format(recs));
  // Saída em JSON para CI
  fs.writeFileSync('sql_recommendations.json', JSON.stringify(recs,null,2));
}

module.exports = { recommend };

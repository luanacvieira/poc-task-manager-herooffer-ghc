-- Query (intencionalmente não otimizada) para demonstrar recomendações
SELECT *
FROM tasks t
WHERE t.priority IN ('LOW','MEDIUM','HIGH')
  AND t.createdAt BETWEEN '2025-01-01' AND '2025-12-31'
  AND (
      SELECT COUNT(*) FROM tasks t2
      WHERE t2.createdAt BETWEEN '2025-01-01' AND '2025-12-31'
        AND t2.priority = t.priority
    ) > 0
ORDER BY t.createdAt DESC
LIMIT 200;

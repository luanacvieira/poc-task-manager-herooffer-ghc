-- Query otimizada com melhorias de performance
-- Índices recomendados:
-- CREATE INDEX idx_tasks_priority_created ON tasks(priority, createdAt DESC);
-- CREATE INDEX idx_tasks_created ON tasks(createdAt);

-- Versão original (não otimizada) - mantida para referência
-- SELECT *
-- FROM tasks t
-- WHERE t.priority IN ('LOW','MEDIUM','HIGH')
--   AND t.createdAt BETWEEN '2025-01-01' AND '2025-12-31'
--   AND (
--       SELECT COUNT(*) FROM tasks t2
--       WHERE t2.createdAt BETWEEN '2025-01-01' AND '2025-12-31'
--         AND t2.priority = t.priority
--     ) > 0
-- ORDER BY t.createdAt DESC
-- LIMIT 200;

-- Versão otimizada
SELECT 
    t.id,
    t.title,
    t.description,
    t.priority,
    t.status,
    t.createdAt,
    t.updatedAt
FROM tasks t
WHERE t.priority IN ('LOW', 'MEDIUM', 'HIGH')
  AND t.createdAt >= '2025-01-01'
  AND t.createdAt < '2025-12-31 23:59:59.999'
ORDER BY t.createdAt DESC
LIMIT 200;

-- Query adicional: Métricas agregadas por prioridade
SELECT 
    priority,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    MIN(createdAt) as first_task,
    MAX(createdAt) as last_task
FROM tasks
WHERE createdAt >= '2025-01-01'
  AND createdAt < '2025-12-31 23:59:59.999'
  AND priority IN ('LOW', 'MEDIUM', 'HIGH')
GROUP BY priority
ORDER BY 
    CASE priority
        WHEN 'HIGH' THEN 1
        WHEN 'MEDIUM' THEN 2
        WHEN 'LOW' THEN 3
    END;



-- Query otimizada para melhor performance
-- Índices recomendados:
-- CREATE INDEX idx_tasks_priority ON tasks(priority);
-- CREATE INDEX idx_tasks_created_at ON tasks(createdAt);
-- CREATE INDEX idx_tasks_priority_created_at ON tasks(priority, createdAt DESC);

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
  AND t.createdAt < '2026-01-01'
ORDER BY t.createdAt DESC
LIMIT 200;

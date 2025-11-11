-- Optimized query for task metrics with best practices
-- Recommended indexes:
-- CREATE INDEX idx_tasks_priority_created ON tasks(priority, createdAt DESC);
-- CREATE INDEX idx_tasks_created_priority ON tasks(createdAt DESC, priority);

SELECT 
    t.id,
    t.title,
    t.description,
    t.priority,
    t.status,
    t.createdAt,
    t.updatedAt,
    t.assignedTo
FROM tasks t
WHERE t.priority IN ('LOW', 'MEDIUM', 'HIGH')
  AND t.createdAt >= '2025-01-01'
  AND t.createdAt < '2026-01-01'
ORDER BY t.createdAt DESC
LIMIT 200;

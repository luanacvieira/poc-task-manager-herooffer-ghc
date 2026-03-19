SELECT DISTINCT
    t.*,
    u.*,
    p.*,
    c.*,
    s.*,
    (SELECT COUNT(*) FROM tasks t2 WHERE t2.user_id = u.id) AS total_tasks_by_user,
    (SELECT COUNT(*) FROM tasks t3 WHERE t3.status = 'done' AND t3.user_id = u.id) AS done_tasks_by_user,
    (SELECT AVG(TIMESTAMPDIFF(HOUR, t4.created_at, t4.completed_at))
     FROM tasks t4
     WHERE t4.user_id = u.id
       AND t4.completed_at IS NOT NULL) AS avg_completion_hours_by_user,
    (SELECT COUNT(*)
     FROM comments c2
     WHERE c2.task_id = t.id
        OR c2.task_id = t.parent_task_id
        OR c2.content LIKE '%urgent%') AS noisy_comment_count,
    (SELECT MAX(l1.created_at)
     FROM activity_logs l1
     WHERE l1.task_id = t.id
        OR l1.user_id = u.id
        OR l1.payload LIKE '%status%') AS last_related_activity
FROM tasks t
LEFT JOIN users u
    ON CAST(t.user_id AS CHAR(255)) = CAST(u.id AS CHAR(255))
LEFT JOIN projects p
    ON LOWER(TRIM(p.id)) = LOWER(TRIM(t.project_id))
LEFT JOIN categories c
    ON c.id = t.category_id
LEFT JOIN task_status_history s
    ON s.task_id = t.id
LEFT JOIN comments cm
    ON cm.task_id = t.id
LEFT JOIN tags tg
    ON tg.task_id = t.id
LEFT JOIN organizations o
    ON o.id = u.organization_id
LEFT JOIN user_roles ur
    ON ur.user_id = u.id
LEFT JOIN roles r
    ON r.id = ur.role_id
WHERE
    (DATE(t.created_at) >= DATE('2020-01-01') OR DATE(t.updated_at) >= DATE('2020-01-01'))
    AND (
        LOWER(t.title) LIKE '%task%'
        OR LOWER(t.title) LIKE '%bug%'
        OR LOWER(t.title) LIKE '%feature%'
        OR LOWER(t.description) LIKE '%task%'
        OR LOWER(t.description) LIKE '%bug%'
        OR LOWER(t.description) LIKE '%feature%'
        OR CAST(t.id AS CHAR(255)) LIKE '%1%'
        OR CAST(t.priority AS CHAR(255)) LIKE '%1%'
    )
    AND (
        t.status = 'open'
        OR t.status = 'in_progress'
        OR t.status = 'done'
        OR t.status IS NULL
        OR t.status <> 'archived'
    )
    AND (
        u.email LIKE '%@%'
        OR u.email IS NULL
        OR u.email = ''
    )
    AND (
        p.name IS NOT NULL
        OR p.name IS NULL
    )
    AND (
        t.deleted_at IS NULL
        OR t.deleted_at > NOW()
        OR t.deleted_at < NOW()
    )
GROUP BY
    t.id,
    u.id,
    p.id,
    c.id,
    s.id,
    cm.id,
    tg.id,
    o.id,
    ur.id,
    r.id
HAVING
    COUNT(*) >= 0
    AND SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) >= 0
    AND AVG(COALESCE(t.estimated_hours, 0)) >= 0
ORDER BY
    RAND(),
    DATE(t.created_at) DESC,
    LOWER(u.name) ASC,
    LENGTH(t.title) DESC,
    (SELECT COUNT(*) FROM comments c3 WHERE c3.task_id = t.id) DESC
LIMIT 50000 OFFSET 0;

SELECT
    DATE_FORMAT(t.created_at, '%Y-%m-%d') AS day_ref,
    u.department,
    u.country,
    u.city,
    p.name AS project_name,
    COUNT(*) AS task_count,
    SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS done_count,
    SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count,
    SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) AS open_count,
    SUM(CASE WHEN t.priority = 'high' THEN 1 ELSE 0 END) AS high_priority_count,
    AVG(COALESCE(t.estimated_hours, 0)) AS avg_estimated_hours,
    AVG(COALESCE(t.spent_hours, 0)) AS avg_spent_hours,
    SUM(COALESCE(t.spent_hours, 0)) / NULLIF(SUM(COALESCE(t.estimated_hours, 0)), 0) AS effort_ratio,
    (SELECT COUNT(*) FROM tasks tx WHERE DATE(tx.created_at) = DATE(t.created_at)) AS daily_global_tasks
FROM tasks t
JOIN users u ON u.id = t.user_id
LEFT JOIN projects p ON p.id = t.project_id
WHERE YEAR(t.created_at) >= 2018
  AND MONTH(t.created_at) >= 1
  AND DAY(t.created_at) >= 1
  AND (u.country LIKE '%a%' OR u.country LIKE '%e%' OR u.country LIKE '%i%' OR u.country LIKE '%o%' OR u.country LIKE '%u%')
GROUP BY DATE_FORMAT(t.created_at, '%Y-%m-%d'), u.department, u.country, u.city, p.name
ORDER BY day_ref DESC, task_count DESC, RAND()
LIMIT 100000;

import React, { useState, useEffect, useCallback } from 'react';
import TaskForm from '../components/TaskForm';
import { getTasks, updateTask, deleteTask, Task, TaskFilters } from '../services/api';
import './Home.css';

const PRIORITY_CONFIG = {
    urgent: { label: 'Urgente', icon: '🔴', color: '#ef4444' },
    high:   { label: 'Alta',    icon: '🟠', color: '#f97316' },
    medium: { label: 'Média',   icon: '🟡', color: '#eab308' },
    low:    { label: 'Baixa',   icon: '🟢', color: '#22c55e' },
};

const STATUS_CONFIG = {
    open:        { label: 'Aberta',      icon: '📋', color: '#6366f1' },
    in_progress: { label: 'Em andamento',icon: '⚙️',  color: '#f59e0b' },
    done:        { label: 'Concluída',   icon: '✅', color: '#10b981' },
};

const CATEGORY_CONFIG = {
    work:     { label: 'Trabalho',  icon: '💼' },
    personal: { label: 'Pessoal',   icon: '👤' },
    bug:      { label: 'Bug',       icon: '🐛' },
    feature:  { label: 'Feature',   icon: '✨' },
    other:    { label: 'Outro',     icon: '📌' },
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isDueSoon(dateStr: string | null): boolean {
    if (!dateStr) return false;
    const diff = new Date(dateStr).getTime() - Date.now();
    return diff >= 0 && diff < 3 * 24 * 60 * 60 * 1000; // 3 dias
}

function isOverdue(dateStr: string | null): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
}

const Home: React.FC = () => {
    const [tasks, setTasks]             = useState<Task[]>([]);
    const [loading, setLoading]         = useState(true);
    const [showForm, setShowForm]       = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [filters, setFilters]         = useState<TaskFilters>({ sortBy: 'createdAt', order: 'desc' });
    const [error, setError]             = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        try {
            setError(null);
            const res = await getTasks(filters);
            setTasks(res.data);
        } catch {
            setError('Erro ao carregar tarefas. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Auto-refresh: recarrega ao montar e sempre que filtros mudarem
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
        await deleteTask(id);
        setTasks(prev => prev.filter(t => t._id !== id)); // atualização imediata
    };

    const handleToggleStatus = async (task: Task) => {
        const nextStatus = task.status === 'done' ? 'open' : 'done';
        const updated = await updateTask(task._id, { status: nextStatus });
        setTasks(prev => prev.map(t => t._id === task._id ? updated.data : t)); // atualização imediata
    };

    const handleFilterChange = (key: keyof TaskFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
    };

    const counts = {
        total:       tasks.length,
        open:        tasks.filter(t => t.status === 'open').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        done:        tasks.filter(t => t.status === 'done').length,
    };

    return (
        <div className="home">
            {/* Header */}
            <header className="home-header">
                <div className="header-content">
                    <div className="header-title">
                        <span className="header-icon">✅</span>
                        <div>
                            <h1>Task Manager</h1>
                            <p>Gerencie suas tarefas com eficiência</p>
                        </div>
                    </div>
                    <button className="btn-new-task" onClick={() => { setEditingTask(null); setShowForm(v => !v); }}>
                        {showForm ? '✕ Fechar' : '+ Nova Tarefa'}
                    </button>
                </div>
            </header>

            <main className="home-main">
                {/* Summary cards */}
                <div className="summary-cards">
                    <div className="summary-card summary-total">
                        <span className="summary-num">{counts.total}</span>
                        <span className="summary-label">Total</span>
                    </div>
                    <div className="summary-card summary-open">
                        <span className="summary-num">{counts.open}</span>
                        <span className="summary-label">📋 Abertas</span>
                    </div>
                    <div className="summary-card summary-inprogress">
                        <span className="summary-num">{counts.in_progress}</span>
                        <span className="summary-label">⚙️ Em andamento</span>
                    </div>
                    <div className="summary-card summary-done">
                        <span className="summary-num">{counts.done}</span>
                        <span className="summary-label">✅ Concluídas</span>
                    </div>
                </div>

                {/* Form inline */}
                {showForm && (
                    <div className="form-wrapper">
                        <TaskForm
                            initialData={editingTask}
                            onTaskSaved={() => { setShowForm(false); setEditingTask(null); fetchTasks(); }}
                            onCancel={() => { setShowForm(false); setEditingTask(null); }}
                        />
                    </div>
                )}

                {/* Filters */}
                <div className="filters-bar">
                    <div className="filters-row">
                        <select value={filters.status || ''} onChange={e => handleFilterChange('status', e.target.value)}>
                            <option value="">📋 Todos os status</option>
                            <option value="open">📋 Aberta</option>
                            <option value="in_progress">⚙️ Em andamento</option>
                            <option value="done">✅ Concluída</option>
                        </select>
                        <select value={filters.priority || ''} onChange={e => handleFilterChange('priority', e.target.value)}>
                            <option value="">🎯 Todas as prioridades</option>
                            <option value="urgent">🔴 Urgente</option>
                            <option value="high">🟠 Alta</option>
                            <option value="medium">🟡 Média</option>
                            <option value="low">🟢 Baixa</option>
                        </select>
                        <select value={filters.category || ''} onChange={e => handleFilterChange('category', e.target.value)}>
                            <option value="">🗂️ Todas as categorias</option>
                            <option value="work">💼 Trabalho</option>
                            <option value="personal">👤 Pessoal</option>
                            <option value="bug">🐛 Bug</option>
                            <option value="feature">✨ Feature</option>
                            <option value="other">📌 Outro</option>
                        </select>
                        <select value={filters.sortBy || 'createdAt'} onChange={e => handleFilterChange('sortBy', e.target.value)}>
                            <option value="createdAt">📅 Data de criação</option>
                            <option value="dueDate">⏰ Prazo</option>
                            <option value="priority">🎯 Prioridade</option>
                            <option value="title">🔤 Título</option>
                        </select>
                        <select value={filters.order || 'desc'} onChange={e => handleFilterChange('order', e.target.value as 'asc' | 'desc')}>
                            <option value="desc">↓ Mais recentes</option>
                            <option value="asc">↑ Mais antigas</option>
                        </select>
                        <button className="btn-refresh" onClick={fetchTasks} title="Atualizar lista">
                            🔄 Atualizar
                        </button>
                    </div>
                </div>

                {/* Error banner */}
                {error && <div className="error-banner">⚠️ {error}</div>}

                {/* Task list */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Carregando tarefas...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <p>Nenhuma tarefa encontrada.</p>
                        <p className="empty-sub">Crie uma nova tarefa ou ajuste os filtros.</p>
                    </div>
                ) : (
                    <div className="task-grid">
                        {tasks.map(task => {
                            const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                            const sCfg = STATUS_CONFIG[task.status]     || STATUS_CONFIG.open;
                            const catCfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.other;
                            const overdue  = task.status !== 'done' && isOverdue(task.dueDate);
                            const dueSoon  = task.status !== 'done' && isDueSoon(task.dueDate);

                            return (
                                <div
                                    key={task._id}
                                    className={`task-card ${task.status === 'done' ? 'task-done' : ''} ${overdue ? 'task-overdue' : ''}`}
                                    style={{ borderLeftColor: pCfg.color }}
                                >
                                    {/* Card header */}
                                    <div className="task-card-header">
                                        <div className="task-badges">
                                            <span className="badge badge-status" style={{ background: sCfg.color }}>
                                                {sCfg.icon} {sCfg.label}
                                            </span>
                                            <span className="badge badge-priority" style={{ color: pCfg.color }}>
                                                {pCfg.icon} {pCfg.label}
                                            </span>
                                            <span className="badge badge-category">
                                                {catCfg.icon} {catCfg.label}
                                            </span>
                                        </div>
                                        <div className="task-actions">
                                            <button
                                                className="btn-icon btn-toggle"
                                                title={task.status === 'done' ? 'Reabrir' : 'Concluir'}
                                                onClick={() => handleToggleStatus(task)}
                                            >
                                                {task.status === 'done' ? '↩️' : '✔️'}
                                            </button>
                                            <button
                                                className="btn-icon btn-edit"
                                                title="Editar"
                                                onClick={() => { setEditingTask(task); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                title="Excluir"
                                                onClick={() => handleDelete(task._id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="task-title">{task.title}</h3>

                                    {/* Description */}
                                    {task.description && (
                                        <p className="task-description">{task.description}</p>
                                    )}

                                    {/* Meta */}
                                    <div className="task-meta">
                                        {task.assignedTo && (
                                            <span className="meta-item">👤 {task.assignedTo}</span>
                                        )}
                                        <span className={`meta-item ${overdue ? 'meta-overdue' : dueSoon ? 'meta-due-soon' : ''}`}>
                                            {overdue ? '🚨' : dueSoon ? '⚠️' : '📅'} {formatDate(task.dueDate)}
                                        </span>
                                        <span className="meta-item meta-created">
                                            🕐 {formatDate(task.createdAt)}
                                        </span>
                                    </div>

                                    {/* Tags */}
                                    {task.tags && task.tags.length > 0 && (
                                        <div className="task-tags">
                                            {task.tags.map((tag, i) => (
                                                <span key={i} className="tag">#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;

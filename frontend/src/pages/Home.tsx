
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from '../components/TaskFormNew';
import './Home.css';

interface Task {
    _id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    category: 'work' | 'personal' | 'study' | 'health' | 'shopping' | 'other';
    tags: string[];
    assignedTo: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

const Home = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        category: '',
        priority: '',
        completed: ''
    });

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.category) params.append('category', filter.category);
            if (filter.priority) params.append('priority', filter.priority);
            if (filter.completed) params.append('completed', filter.completed);
            
            const response = await axios.get(`/api/tasks?${params.toString()}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert('Erro ao carregar tarefas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [filter]);

    const handleTaskAdded = () => {
        fetchTasks();
    };

    const toggleTask = async (id: string) => {
        try {
            await axios.patch(`/api/tasks/${id}/toggle`);
            fetchTasks();
        } catch (error) {
            console.error('Error toggling task:', error);
            alert('Erro ao alterar status da tarefa');
        }
    };

    const deleteTask = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
        
        try {
            await axios.delete(`/api/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Erro ao excluir tarefa');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };



    const getPriorityIcon = (priority: string) => {
        const icons = {
            low: '🟢',
            medium: '🟡',
            high: '🟠',
            urgent: '🔴'
        };
        return icons[priority as keyof typeof icons] || '⚪';
    };

    const getCategoryIcon = (category: string) => {
        const icons = {
            work: '💼',
            personal: '👤',
            study: '📚',
            health: '🏥',
            shopping: '🛒',
            other: '📋'
        };
        return icons[category as keyof typeof icons] || '📋';
    };

    const isOverdue = (dueDate?: string) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    return (
        <div className="home-container">
            <header className="header">
                <h1>🚀 Gerenciador de Tarefas</h1>
                <p>Organize suas atividades de forma inteligente</p>
            </header>

            <TaskForm onTaskAdded={handleTaskAdded} />

            <div className="filters-container">
                <h3>🔍 Filtros</h3>
                <div className="filters">
                    <select 
                        value={filter.category} 
                        onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                    >
                        <option value="">Todas as Categorias</option>
                        <option value="work">💼 Trabalho</option>
                        <option value="personal">👤 Pessoal</option>
                        <option value="study">📚 Estudo</option>
                        <option value="health">🏥 Saúde</option>
                        <option value="shopping">🛒 Compras</option>
                        <option value="other">📋 Outros</option>
                    </select>

                    <select 
                        value={filter.priority} 
                        onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
                    >
                        <option value="">Todas as Prioridades</option>
                        <option value="low">🟢 Baixa</option>
                        <option value="medium">🟡 Média</option>
                        <option value="high">🟠 Alta</option>
                        <option value="urgent">🔴 Urgente</option>
                    </select>

                    <select 
                        value={filter.completed} 
                        onChange={(e) => setFilter(prev => ({ ...prev, completed: e.target.value }))}
                    >
                        <option value="">Todos os Status</option>
                        <option value="false">📝 Pendentes</option>
                        <option value="true">✅ Concluídas</option>
                    </select>
                </div>
            </div>

            <div className="tasks-section">
                <h3>📋 Suas Tarefas ({tasks.length})</h3>
                
                {loading ? (
                    <div className="loading">⏳ Carregando tarefas...</div>
                ) : tasks.length === 0 ? (
                    <div className="empty-state">
                        <p>🎯 Nenhuma tarefa encontrada!</p>
                        <p>Crie sua primeira tarefa usando o formulário acima.</p>
                    </div>
                ) : (
                    <div className="tasks-grid">
                        {tasks.map(task => (
                            <div 
                                key={task._id} 
                                className={`task-card ${task.completed ? 'completed' : ''} ${isOverdue(task.dueDate) && !task.completed ? 'overdue' : ''}`}
                            >
                                <div className="task-header">
                                    <div className="task-meta">
                                        <span className="priority">{getPriorityIcon(task.priority)}</span>
                                        <span className="category">{getCategoryIcon(task.category)}</span>
                                        {isOverdue(task.dueDate) && !task.completed && (
                                            <span className="overdue-badge">⚠️ Atrasada</span>
                                        )}
                                    </div>
                                    <div className="task-actions">
                                        <button
                                            onClick={() => toggleTask(task._id)}
                                            className="toggle-btn"
                                            title={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                                        >
                                            {task.completed ? '↩️' : '✅'}
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task._id)}
                                            className="delete-btn"
                                            title="Excluir tarefa"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="task-content">
                                    <h4 className={task.completed ? 'completed-text' : ''}>{task.title}</h4>
                                    {task.description && (
                                        <p className="description">{task.description}</p>
                                    )}
                                </div>

                                <div className="task-details">
                                    {task.dueDate && (
                                        <div className="detail">
                                            <span>📅 {formatDate(task.dueDate)}</span>
                                        </div>
                                    )}
                                    {task.assignedTo && (
                                        <div className="detail">
                                            <span>👤 {task.assignedTo}</span>
                                        </div>
                                    )}
                                    {task.tags.length > 0 && (
                                        <div className="tags">
                                            {task.tags.map((tag, index) => (
                                                <span key={index} className="tag">#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;

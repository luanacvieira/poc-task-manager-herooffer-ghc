
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import TaskForm from '../components/TaskForm';

import { Task } from '../services/api';

const Home = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
        } catch (error) {
            console.error('Erro ao carregar tasks:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleTaskAdded = () => {
        fetchTasks(); // Atualiza a lista automaticamente
    };

    const toggleComplete = async (taskId: string, completed: boolean) => {
        try {
            await axios.put(`/api/tasks/${taskId}`, { completed: !completed });
            fetchTasks(); // Atualiza após marcar/desmarcar
        } catch (error) {
            console.error('Erro ao atualizar task:', error);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
            try {
                await axios.delete(`/api/tasks/${taskId}`);
                fetchTasks(); // Atualiza após excluir
            } catch (error) {
                console.error('Erro ao excluir task:', error);
            }
        }
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: '#22c55e',
            medium: '#eab308',
            high: '#f97316',
            urgent: '#ef4444'
        };
        return colors[priority as keyof typeof colors] || '#6b7280';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="home-container">
            <header>
                <h1>📋 Task Manager Pro</h1>
                <p>Gerencie suas tarefas de forma eficiente</p>
            </header>

            <TaskForm onTaskAdded={handleTaskAdded} />

            <div className="tasks-section">
                <h2>📝 Minhas Tarefas ({tasks.length})</h2>
                
                {loading ? (
                    <p>Carregando tarefas...</p>
                ) : tasks.length === 0 ? (
                    <p className="no-tasks">Nenhuma tarefa encontrada. Adicione uma nova tarefa acima! 🎯</p>
                ) : (
                    <div className="tasks-grid">
                        {tasks.map((task) => (
                            <div key={task._id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                                <div className="task-header">
                                    <h3>
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => toggleComplete(task._id, task.completed)}
                                        />
                                        {task.title}
                                    </h3>
                                    <span 
                                        className="priority-badge"
                                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                                    >
                                        {task.priority}
                                    </span>
                                </div>

                                {task.description && (
                                    <p className="task-description">{task.description}</p>
                                )}

                                <div className="task-meta">
                                    <span className="category">📂 {task.category}</span>
                                    {task.dueDate && (
                                        <span className="due-date">📅 {formatDate(task.dueDate)}</span>
                                    )}
                                </div>

                                {task.tags.length > 0 && (
                                    <div className="task-tags">
                                        {task.tags.map((tag, index) => (
                                            <span key={index} className="tag">#{tag}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="task-actions">
                                    <small>Criado: {formatDate(task.createdAt)}</small>
                                    <button 
                                        onClick={() => deleteTask(task._id)}
                                        className="btn-delete"
                                    >
                                        🗑️
                                    </button>
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

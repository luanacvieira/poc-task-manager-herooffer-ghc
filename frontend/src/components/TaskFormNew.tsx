import React, { useState } from 'react';
import axios from 'axios';
import './TaskForm.css';

interface TaskFormProps {
    onTaskAdded: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        category: 'work',
        tags: '',
        assignedTo: '',
        userId: 'user1'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setIsSubmitting(true);
        try {
            const taskData = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                dueDate: formData.dueDate || null
            };

            await axios.post('/api/tasks', taskData);
            
            // Reset form
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: '',
                category: 'work',
                tags: '',
                assignedTo: '',
                userId: 'user1'
            });

            // Refresh task list
            onTaskAdded();
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Erro ao criar tarefa. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="task-form-container">
            <h2>📝 Nova Tarefa</h2>
            <form onSubmit={handleSubmit} className="task-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="title">Título *</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Digite o título da tarefa"
                            required
                            maxLength={200}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="priority">Prioridade</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                        >
                            <option value="low">🟢 Baixa</option>
                            <option value="medium">🟡 Média</option>
                            <option value="high">🟠 Alta</option>
                            <option value="urgent">🔴 Urgente</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Descreva os detalhes da tarefa (opcional)"
                        rows={3}
                        maxLength={1000}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category">Categoria</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="work">💼 Trabalho</option>
                            <option value="personal">👤 Pessoal</option>
                            <option value="study">📚 Estudo</option>
                            <option value="health">🏥 Saúde</option>
                            <option value="shopping">🛒 Compras</option>
                            <option value="other">📋 Outros</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dueDate">Data Limite</label>
                        <input
                            id="dueDate"
                            name="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="assignedTo">Responsável</label>
                        <input
                            id="assignedTo"
                            name="assignedTo"
                            type="text"
                            value={formData.assignedTo}
                            onChange={handleChange}
                            placeholder="Nome da pessoa responsável"
                            maxLength={100}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tags">Tags</label>
                        <input
                            id="tags"
                            name="tags"
                            type="text"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="tag1, tag2, tag3"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting || !formData.title.trim()}
                >
                    {isSubmitting ? '⏳ Criando...' : '✅ Criar Tarefa'}
                </button>
            </form>
        </div>
    );
};

export default TaskForm;
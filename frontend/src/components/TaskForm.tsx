
import React, { useState } from 'react';
import axios from 'axios';

interface TaskFormProps {
    onTaskAdded: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        category: 'other',
        tags: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        try {
            const taskData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                dueDate: formData.dueDate || null,
                completed: false,
                assignedTo: 'user1',
                userId: 'user1'
            };

            await axios.post('/api/tasks', taskData);
            
            // Limpar formulário
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: '',
                category: 'other',
                tags: ''
            });
            
            // Atualizar lista automaticamente
            onTaskAdded();
        } catch (error) {
            console.error('Erro ao criar task:', error);
            alert('Erro ao criar tarefa!');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="task-form">
            <h2>➕ Nova Tarefa</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Título da tarefa *"
                        required
                    />
                    <select name="priority" value={formData.priority} onChange={handleInputChange}>
                        <option value="low">🟢 Baixa</option>
                        <option value="medium">🟡 Média</option>
                        <option value="high">🟠 Alta</option>
                        <option value="urgent">🔴 Urgente</option>
                    </select>
                </div>

                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descrição (opcional)"
                    rows={2}
                />

                <div className="form-row">
                    <input
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                    />
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="work">💼 Trabalho</option>
                        <option value="personal">🏠 Pessoal</option>
                        <option value="study">📚 Estudos</option>
                        <option value="health">💪 Saúde</option>
                        <option value="other">📋 Outros</option>
                    </select>
                </div>

                <input
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Tags (separadas por vírgula: projeto, urgente, revisão)"
                />

                <button type="submit" className="btn-add">
                    ➕ Adicionar Tarefa
                </button>
            </form>
        </div>
    );
};

export default TaskForm;

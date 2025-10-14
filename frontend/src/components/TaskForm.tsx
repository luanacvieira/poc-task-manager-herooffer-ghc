
import React, { useState } from 'react';
import { createTask, CreateTaskPayload } from '../services/api';

interface TaskFormProps {
    onTaskAdded: () => void;
}

// ❌ TESTE PARA FALHAR TYPECHECK - descomente o bloco para ativar ❌
/*
function TaskFormWithTypeError(props: TaskFormProps) {
    // Erro proposital: chamando onTaskAdded com argumento inesperado
    props.onTaskAdded("invalid"); // ❌ TypeScript vai reclamar: Expected 0 arguments, but got 1
    return <div>Task Form</div>;
}

// 🎯 POC DEMO TypeScript: descomente a linha abaixo para falhar typecheck:
// TaskFormWithTypeError({ onTaskAdded: () => {} });
*/

// ❌ TESTE ESLINT - descomente para falhar ❌
/*
const unusedVar = "test"; // ❌ ESLint: variable not used
console.log(undefinedVar); // ❌ ESLint: variable not defined
*/

// ❌ SECURITY SCAN (Gitleaks) - FUNCIONA ✅ ❌
const API_SECRET_KEY = "sk-live-abcd1234efgh5678ijkl9012"; // ✅ Gitleaks detecta

// ❌ CODEQL VULNERABILITIES - Explícitas para detecção ❌
const userInput = new URLSearchParams(window.location.search).get('input');
document.body.innerHTML = userInput || ''; // 🚨 XSS vulnerability
eval('console.log("' + userInput + '")'); // 🚨 Code injection vulnerability

// Uso da variável para evitar ESLint warning  
console.debug('Security test loaded:', !!API_SECRET_KEY);

const TaskForm: React.FC<TaskFormProps> = ({ onTaskAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        dueDate: '',
        category: 'other',
        tags: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!formData.title.trim()) return;

        try {
            setIsSubmitting(true);
            const taskData: CreateTaskPayload = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                dueDate: formData.dueDate || null,
                category: formData.category,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                completed: false,
                assignedTo: 'user1',
                userId: 'user1'
            };

            await createTask(taskData);
            
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
        } finally {
            setIsSubmitting(false);
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
                        aria-label="Título"
                        required
                    />
                    <select name="priority" value={formData.priority} onChange={handleInputChange} aria-label="Prioridade">
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
                    aria-label="Descrição"
                    rows={2}
                />

                <div className="form-row">
                    <input
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        aria-label="Data Limite"
                    />
                    <select name="category" value={formData.category} onChange={handleInputChange} aria-label="Categoria">
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
                    aria-label="Tags"
                />

                <button type="submit" className="btn-add" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : '➕ Adicionar Tarefa'}
                </button>
            </form>
        </div>
    );
};

export default TaskForm;


import React, { useState, useEffect } from 'react';
import { createTask, updateTask, Task } from '../services/api';
import './TaskForm.css';

type TaskFormProps = {
    initialData?: Task | null;
    onTaskSaved: () => void;
    onCancel: () => void;
};

type FormState = {
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'work' | 'personal' | 'bug' | 'feature' | 'other';
    dueDate: string;
    assignedTo: string;
    tags: string;
    userId: string;
};

const EMPTY_FORM: FormState = {
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: 'work',
    dueDate: '',
    assignedTo: '',
    tags: '',
    userId: 'user1',
};

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onTaskSaved, onCancel }) => {
    const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors]     = useState<Partial<FormState>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!initialData;

    // Preenche form quando está editando
    useEffect(() => {
        if (initialData) {
            setFormData({
                title:       initialData.title       || '',
                description: initialData.description || '',
                status:      initialData.status      || 'open',
                priority:    initialData.priority    || 'medium',
                category:    initialData.category    || 'work',
                dueDate:     initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
                assignedTo:  initialData.assignedTo  || '',
                tags:        Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
                userId:      initialData.userId      || 'user1',
            });
        } else {
            setFormData(EMPTY_FORM);
        }
        setErrors({});
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormState]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<FormState> = {};
        if (!formData.title.trim())  newErrors.title  = 'Título é obrigatório.';
        if (!formData.userId.trim()) newErrors.userId = 'User ID é obrigatório.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                title:       formData.title.trim(),
                description: formData.description,
                status:      formData.status,
                priority:    formData.priority,
                category:    formData.category,
                dueDate:     formData.dueDate || null,
                assignedTo:  formData.assignedTo,
                tags:        formData.tags
                    ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
                    : [],
                userId:      formData.userId.trim(),
            };

            if (isEditing && initialData) {
                await updateTask(initialData._id, payload);
            } else {
                await createTask(payload as any);
            }
            onTaskSaved();
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'Erro ao salvar tarefa. Tente novamente.';
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="task-form-container">
            <div className="task-form-header">
                <h2>{isEditing ? '✏️ Editar Tarefa' : '📝 Nova Tarefa'}</h2>
                <button className="btn-cancel-form" type="button" onClick={onCancel}>✕ Cancelar</button>
            </div>
            <form onSubmit={handleSubmit} className="task-form" noValidate>

                <div className="form-row">
                    <div className={`form-group form-group-wide ${errors.title ? 'has-error' : ''}`}>
                        <label htmlFor="title">Título <span className="required">*</span></label>
                        <input
                            id="title" name="title" type="text"
                            value={formData.title} onChange={handleChange}
                            placeholder="Digite o título da tarefa"
                            maxLength={200}
                        />
                        {errors.title && <span className="field-error">{errors.title}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange}>
                            <option value="open">📋 Aberta</option>
                            <option value="in_progress">⚙️ Em andamento</option>
                            <option value="done">✅ Concluída</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição</label>
                    <textarea
                        id="description" name="description"
                        value={formData.description} onChange={handleChange}
                        placeholder="Descreva os detalhes da tarefa (opcional)"
                        rows={3} maxLength={1000}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="priority">Prioridade</label>
                        <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                            <option value="low">🟢 Baixa</option>
                            <option value="medium">🟡 Média</option>
                            <option value="high">🟠 Alta</option>
                            <option value="urgent">🔴 Urgente</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Categoria</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange}>
                            <option value="work">💼 Trabalho</option>
                            <option value="personal">👤 Pessoal</option>
                            <option value="bug">🐛 Bug</option>
                            <option value="feature">✨ Feature</option>
                            <option value="other">📌 Outro</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dueDate">Prazo</label>
                        <input
                            id="dueDate" name="dueDate" type="date"
                            value={formData.dueDate} onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="assignedTo">Responsável</label>
                        <input
                            id="assignedTo" name="assignedTo" type="text"
                            value={formData.assignedTo} onChange={handleChange}
                            placeholder="Nome do responsável"
                            maxLength={100}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tags">Tags <span className="hint">(separadas por vírgula)</span></label>
                        <input
                            id="tags" name="tags" type="text"
                            value={formData.tags} onChange={handleChange}
                            placeholder="frontend, backend, api"
                        />
                    </div>
                    <div className={`form-group ${errors.userId ? 'has-error' : ''}`}>
                        <label htmlFor="userId">User ID <span className="required">*</span></label>
                        <input
                            id="userId" name="userId" type="text"
                            value={formData.userId} onChange={handleChange}
                            placeholder="user1"
                            maxLength={50}
                        />
                        {errors.userId && <span className="field-error">{errors.userId}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? '⏳ Salvando...'
                            : isEditing ? '💾 Salvar Alterações' : '✅ Criar Tarefa'
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskForm;



import axios from 'axios';

export interface Task {
    _id: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'work' | 'personal' | 'bug' | 'feature' | 'other';
    dueDate: string | null;
    assignedTo: string;
    tags: string[];
    completed: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaskFilters {
    status?: string;
    priority?: string;
    category?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export const getTasks = (filters: TaskFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status)   params.append('status',   filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.sortBy)   params.append('sortBy',   filters.sortBy);
    if (filters.order)    params.append('order',    filters.order);
    return axios.get<Task[]>(`/api/tasks?${params.toString()}`);
};

export const createTask = (task: Omit<Task, '_id' | 'completed' | 'createdAt' | 'updatedAt'>) =>
    axios.post<Task>('/api/tasks', task);

export const updateTask = (id: string, data: Partial<Task>) =>
    axios.put<Task>(`/api/tasks/${id}`, data);

export const deleteTask = (id: string) =>
    axios.delete(`/api/tasks/${id}`);



import axios, { AxiosPromise } from 'axios';

// TESTE PARA FALHAR LINT
const x = 1; // variável não usada

// Domain types centralizados para reutilização em componentes e testes
export interface Task {
	_id: string;
	title: string;
	description: string;
	completed: boolean;
	priority: 'low' | 'medium' | 'high' | 'urgent';
	dueDate?: string | null;
	category: string;
	tags: string[];
	createdAt?: string; // pode não existir imediatamente após criação no frontend
	assignedTo: string;
	userId?: string;
}

export interface CreateTaskPayload {
	title: string;
	description: string;
	priority: Task['priority'];
	dueDate: string | null;
	category: string;
	tags: string[];
	completed: boolean;
	assignedTo: string;
	userId: string;
}

export const getTasks = (): AxiosPromise<Task[]> => axios.get('/api/tasks');
export const createTask = (task: CreateTaskPayload): AxiosPromise<Task> => axios.post('/api/tasks', task);
export const deleteTask = (id: string): AxiosPromise<void> => axios.delete(`/api/tasks/${id}`);

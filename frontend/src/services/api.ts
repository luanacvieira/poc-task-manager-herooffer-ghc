
import axios from 'axios';

export const getTasks = () => axios.get('/api/tasks');
export const createTask = (task: any) => axios.post('/api/tasks', task);
export const deleteTask = (id: string) => axios.delete(`/api/tasks/${id}`);

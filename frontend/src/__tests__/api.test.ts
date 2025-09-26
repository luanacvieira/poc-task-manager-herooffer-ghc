import axios from 'axios';
import { getTasks, createTask, deleteTask } from '../services/api';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTasks', () => {
        test('should call axios.get with correct endpoint', async () => {
            const mockResponse = { data: [] };
            mockedAxios.get.mockResolvedValueOnce(mockResponse);

            const result = await getTasks();

            expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks');
            expect(result).toEqual(mockResponse);
        });

        test('should handle errors when fetching tasks', async () => {
            const mockError = new Error('Network Error');
            mockedAxios.get.mockRejectedValueOnce(mockError);

            await expect(getTasks()).rejects.toThrow('Network Error');
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks');
        });
    });

    describe('createTask', () => {
        test('should call axios.post with correct endpoint and data', async () => {
            const taskData = {
                title: 'New Task',
                description: 'Task description',
                priority: 'high',
                completed: false
            };
            const mockResponse = { data: { _id: '123', ...taskData } };
            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const result = await createTask(taskData);

            expect(mockedAxios.post).toHaveBeenCalledWith('/api/tasks', taskData);
            expect(result).toEqual(mockResponse);
        });

        test('should handle validation errors when creating task', async () => {
            const taskData = { title: '' }; // Invalid data
            const mockError = { 
                response: { 
                    status: 400, 
                    data: { message: 'Title is required' } 
                } 
            };
            mockedAxios.post.mockRejectedValueOnce(mockError);

            await expect(createTask(taskData)).rejects.toEqual(mockError);
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/tasks', taskData);
        });

        test('should handle server errors when creating task', async () => {
            const taskData = { title: 'Valid Task' };
            const mockError = { 
                response: { 
                    status: 500, 
                    data: { message: 'Internal Server Error' } 
                } 
            };
            mockedAxios.post.mockRejectedValueOnce(mockError);

            await expect(createTask(taskData)).rejects.toEqual(mockError);
        });
    });

    describe('deleteTask', () => {
        test('should call axios.delete with correct endpoint and task id', async () => {
            const taskId = '123456';
            const mockResponse = { data: { message: 'Task deleted successfully' } };
            mockedAxios.delete.mockResolvedValueOnce(mockResponse);

            const result = await deleteTask(taskId);

            expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tasks/123456');
            expect(result).toEqual(mockResponse);
        });

        test('should handle not found error when deleting task', async () => {
            const taskId = 'nonexistent-id';
            const mockError = { 
                response: { 
                    status: 404, 
                    data: { message: 'Task not found' } 
                } 
            };
            mockedAxios.delete.mockRejectedValueOnce(mockError);

            await expect(deleteTask(taskId)).rejects.toEqual(mockError);
            expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/tasks/${taskId}`);
        });

        test('should handle server errors when deleting task', async () => {
            const taskId = '123456';
            const mockError = new Error('Server Error');
            mockedAxios.delete.mockRejectedValueOnce(mockError);

            await expect(deleteTask(taskId)).rejects.toThrow('Server Error');
        });

        test('should work with different task id formats', async () => {
            const mockResponse = { data: {} };
            mockedAxios.delete.mockResolvedValue(mockResponse);

            // Test with ObjectId format
            await deleteTask('507f1f77bcf86cd799439011');
            expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tasks/507f1f77bcf86cd799439011');

            // Test with short id
            await deleteTask('123');
            expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tasks/123');

            // Test with UUID format
            await deleteTask('550e8400-e29b-41d4-a716-446655440000');
            expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tasks/550e8400-e29b-41d4-a716-446655440000');
        });
    });

    describe('API integration scenarios', () => {
        test('should handle network timeout errors', async () => {
            const timeoutError = { 
                code: 'ECONNABORTED',
                message: 'timeout of 5000ms exceeded'
            };
            
            mockedAxios.get.mockRejectedValueOnce(timeoutError);
            mockedAxios.post.mockRejectedValueOnce(timeoutError);
            mockedAxios.delete.mockRejectedValueOnce(timeoutError);

            await expect(getTasks()).rejects.toEqual(timeoutError);
            await expect(createTask({})).rejects.toEqual(timeoutError);
            await expect(deleteTask('123')).rejects.toEqual(timeoutError);
        });

        test('should handle CORS errors', async () => {
            const corsError = { 
                message: 'Network Error',
                config: { url: '/api/tasks' }
            };
            
            mockedAxios.get.mockRejectedValueOnce(corsError);

            await expect(getTasks()).rejects.toEqual(corsError);
        });

        test('should handle authentication errors', async () => {
            const authError = { 
                response: { 
                    status: 401, 
                    data: { message: 'Unauthorized' } 
                } 
            };
            
            mockedAxios.get.mockRejectedValueOnce(authError);
            mockedAxios.post.mockRejectedValueOnce(authError);
            mockedAxios.delete.mockRejectedValueOnce(authError);

            await expect(getTasks()).rejects.toEqual(authError);
            await expect(createTask({})).rejects.toEqual(authError);
            await expect(deleteTask('123')).rejects.toEqual(authError);
        });
    });
});
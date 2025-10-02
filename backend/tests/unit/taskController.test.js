const taskController = require('../../src/controllers/taskController');
const Task = require('../../src/models/taskModel');

// Mock do modelo Task
jest.mock('../../src/models/taskModel');

describe('Task Controller Unit Tests', () => {
    let mockReq, mockRes;
    
    beforeEach(() => {
        // Reset dos mocks
        jest.clearAllMocks();
        
        // Mock do request e response
        mockReq = {
            body: {},
            params: {}
        };
        
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        
        // Mock do console para capturar logs
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
        // Restaurar console
        console.log.mockRestore();
        console.error.mockRestore();
    });
    
    describe('getTasks', () => {
        it('should return all tasks successfully', async () => {
            const mockTasks = [
                {
                    _id: '507f1f77bcf86cd799439011',
                    title: 'Test Task 1',
                    completed: false,
                    createdAt: new Date()
                },
                {
                    _id: '507f1f77bcf86cd799439012', 
                    title: 'Test Task 2',
                    completed: true,
                    createdAt: new Date()
                }
            ];
            
            // Mock do método find com sort
            const mockFind = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockTasks)
            });
            Task.find = mockFind;
            
            await taskController.getTasks(mockReq, mockRes);
            
            expect(Task.find).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
            expect(console.log).toHaveBeenCalledWith('📄 Buscando todas as tarefas...');
            expect(console.log).toHaveBeenCalledWith('✅ 2 tarefas encontradas');
        });
        
        it('should handle database errors gracefully', async () => {
            const mockError = new Error('Database connection failed');
            
            const mockFind = jest.fn().mockReturnValue({
                sort: jest.fn().mockRejectedValue(mockError)
            });
            Task.find = mockFind;
            
            await taskController.getTasks(mockReq, mockRes);
            
            expect(console.error).toHaveBeenCalledWith('❌ Erro ao buscar tarefas:', mockError);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch tasks' });
        });
        
        it('should return empty array when no tasks exist', async () => {
            const mockFind = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue([])
            });
            Task.find = mockFind;
            
            await taskController.getTasks(mockReq, mockRes);
            
            expect(mockRes.json).toHaveBeenCalledWith([]);
            expect(console.log).toHaveBeenCalledWith('✅ 0 tarefas encontradas');
        });
    });
    
    describe('createTask', () => {
        it('should create a new task successfully', async () => {
            const mockTaskData = {
                title: 'New Task',
                description: 'Task description',
                userId: 'user123',
                assignedTo: 'user123'
            };
            
            const mockSavedTask = {
                _id: '507f1f77bcf86cd799439011',
                ...mockTaskData,
                completed: false,
                createdAt: new Date()
            };
            
            mockReq.body = mockTaskData;
            
            // Mock do constructor e save
            const mockSave = jest.fn().mockResolvedValue(mockSavedTask);
            Task.mockImplementation(() => ({
                save: mockSave
            }));
            
            await taskController.createTask(mockReq, mockRes);
            
            expect(Task).toHaveBeenCalledWith(mockTaskData);
            expect(mockSave).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockSavedTask);
            expect(console.log).toHaveBeenCalledWith('➕ Criando nova tarefa:', mockTaskData);
        });
        
        it('should handle validation errors', async () => {
            const mockTaskData = { title: '' }; // Invalid data
            const mockError = new Error('Validation failed');
            mockError.message = 'Title is required';
            
            mockReq.body = mockTaskData;
            
            const mockSave = jest.fn().mockRejectedValue(mockError);
            Task.mockImplementation(() => ({
                save: mockSave
            }));
            
            await taskController.createTask(mockReq, mockRes);
            
            expect(console.error).toHaveBeenCalledWith('❌ Erro ao criar tarefa:', mockError);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Failed to create task',
                details: 'Title is required'
            });
        });
    });
    
    describe('updateTask', () => {
        it('should update task successfully', async () => {
            const taskId = '507f1f77bcf86cd799439011';
            const updateData = { completed: true };
            const mockUpdatedTask = {
                _id: taskId,
                title: 'Test Task',
                completed: true,
                updatedAt: new Date()
            };
            
            mockReq.params.id = taskId;
            mockReq.body = updateData;
            
            Task.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedTask);
            
            await taskController.updateTask(mockReq, mockRes);
            
            expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
                taskId,
                updateData,
                { new: true, runValidators: true }
            );
            expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedTask);
            expect(console.log).toHaveBeenCalledWith(`📝 Atualizando tarefa ${taskId}:`, updateData);
        });
        
        it('should return 404 when task not found', async () => {
            const taskId = '507f1f77bcf86cd799439011';
            
            mockReq.params.id = taskId;
            mockReq.body = { completed: true };
            
            Task.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
            
            await taskController.updateTask(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found' });
        });
        
        it('should handle update errors', async () => {
            const taskId = '507f1f77bcf86cd799439011';
            const mockError = new Error('Update failed');
            
            mockReq.params.id = taskId;
            mockReq.body = { completed: true };
            
            Task.findByIdAndUpdate = jest.fn().mockRejectedValue(mockError);
            
            await taskController.updateTask(mockReq, mockRes);
            
            expect(console.error).toHaveBeenCalledWith('❌ Erro ao atualizar tarefa:', mockError);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Failed to update task',
                details: mockError.message
            });
        });
    });
    
    describe('deleteTask', () => {
        it('should delete task successfully', async () => {
            const taskId = '507f1f77bcf86cd799439011';
            const mockDeletedTask = {
                _id: taskId,
                title: 'Test Task'
            };
            
            mockReq.params.id = taskId;
            
            Task.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedTask);
            
            await taskController.deleteTask(mockReq, mockRes);
            
            expect(Task.findByIdAndDelete).toHaveBeenCalledWith(taskId);
            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.send).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(`🗑️ Deletando tarefa ${taskId}`);
        });
        
        it('should return 404 when task not found for deletion', async () => {
            const taskId = '507f1f77bcf86cd799439011';
            
            mockReq.params.id = taskId;
            
            Task.findByIdAndDelete = jest.fn().mockResolvedValue(null);
            
            await taskController.deleteTask(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found' });
        });
        
        it('should handle deletion errors', async () => {
            const taskId = '507f1f77bcf86cd799439011';
            const mockError = new Error('Deletion failed');
            
            mockReq.params.id = taskId;
            
            Task.findByIdAndDelete = jest.fn().mockRejectedValue(mockError);
            
            await taskController.deleteTask(mockReq, mockRes);
            
            expect(console.error).toHaveBeenCalledWith('❌ Erro ao deletar tarefa:', mockError);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to delete task' });
        });
    });
});
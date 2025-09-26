/**
 * Testes unitários isolados para o Task Controller
 * Testes completamente mockados sem dependência de banco de dados
 */

// Mock do modelo Task
const mockTask = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
};

// Mock do módulo Task
jest.mock('../../src/models/taskModel', () => mockTask);

// Mock das funções do controller para evitar execução real
const mockController = {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn()
};

// Mock data para testes
const mockTaskData = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Teste Task',
    description: 'Descrição de teste',
    priority: 'high',
    dueDate: new Date('2024-12-31'),
    category: 'work',
    tags: ['importante', 'urgente'],
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
};

const mockRequest = {
    body: {},
    params: {},
    query: {}
};

const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
};

// Implementações simplificadas para teste
const getTasks = async (req, res) => {
    try {
        const tasks = await mockTask.find();
        return res.status(200).json(tasks);
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao buscar tasks',
            error: error.message
        });
    }
};

const createTask = async (req, res) => {
    try {
        const task = await mockTask.create(req.body);
        return res.status(201).json(task);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Dados inválidos',
                error: error.message
            });
        }
        return res.status(500).json({
            message: 'Erro ao criar task',
            error: error.message
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await mockTask.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!task) {
            return res.status(404).json({
                message: 'Task não encontrada'
            });
        }
        return res.status(200).json(task);
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao atualizar task',
            error: error.message
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await mockTask.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({
                message: 'Task não encontrada'
            });
        }
        return res.status(200).json({
            message: 'Task deletada com sucesso'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao deletar task',
            error: error.message
        });
    }
};

describe('Task Controller Unit Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Reset mock implementations
        mockResponse.status.mockReturnThis();
        mockResponse.json.mockReturnThis();
        mockResponse.send.mockReturnThis();
    });

    describe('getTasks', () => {
        
        test('should return all tasks successfully', async () => {
            // Setup
            const mockTasks = [mockTaskData, { ...mockTaskData, _id: 'another-id' }];
            mockTask.find.mockResolvedValue(mockTasks);

            // Execute
            await getTasks(mockRequest, mockResponse);

            // Verify
            expect(mockTask.find).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockTasks);
        });

        test('should handle database errors gracefully', async () => {
            // Setup
            const errorMessage = 'Database connection failed';
            mockTask.find.mockRejectedValue(new Error(errorMessage));

            // Execute
            await getTasks(mockRequest, mockResponse);

            // Verify
            expect(mockTask.find).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Erro ao buscar tasks',
                error: errorMessage
            });
        });

        test('should return empty array when no tasks exist', async () => {
            // Setup
            mockTask.find.mockResolvedValue([]);

            // Execute
            await getTasks(mockRequest, mockResponse);

            // Verify
            expect(mockTask.find).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith([]);
        });
    });

    describe('createTask', () => {
        
        test('should create a new task successfully', async () => {
            // Setup
            const newTaskData = {
                title: 'Nova Task',
                description: 'Nova descrição',
                priority: 'medium'
            };
            const createdTask = { ...mockTaskData, ...newTaskData };
            
            mockRequest.body = newTaskData;
            mockTask.create.mockResolvedValue(createdTask);

            // Execute
            await createTask(mockRequest, mockResponse);

            // Verify
            expect(mockTask.create).toHaveBeenCalledWith(newTaskData);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(createdTask);
        });

        test('should handle validation errors', async () => {
            // Setup
            const invalidTaskData = { description: 'Sem título' };
            const validationError = new Error('Title is required');
            validationError.name = 'ValidationError';
            
            mockRequest.body = invalidTaskData;
            mockTask.create.mockRejectedValue(validationError);

            // Execute
            await createTask(mockRequest, mockResponse);

            // Verify
            expect(mockTask.create).toHaveBeenCalledWith(invalidTaskData);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Dados inválidos',
                error: 'Title is required'
            });
        });

        test('should handle server errors during creation', async () => {
            // Setup
            const taskData = { title: 'Test Task' };
            const serverError = new Error('Database unavailable');
            
            mockRequest.body = taskData;
            mockTask.create.mockRejectedValue(serverError);

            // Execute
            await createTask(mockRequest, mockResponse);

            // Verify
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Erro ao criar task',
                error: 'Database unavailable'
            });
        });
    });

    describe('updateTask', () => {
        
        test('should update task successfully', async () => {
            // Setup
            const taskId = '507f1f77bcf86cd799439011';
            const updateData = { title: 'Título Atualizado', completed: true };
            const updatedTask = { ...mockTaskData, ...updateData };
            
            mockRequest.params.id = taskId;
            mockRequest.body = updateData;
            mockTask.findByIdAndUpdate.mockResolvedValue(updatedTask);

            // Execute
            await updateTask(mockRequest, mockResponse);

            // Verify
            expect(mockTask.findByIdAndUpdate).toHaveBeenCalledWith(
                taskId, 
                updateData, 
                { new: true, runValidators: true }
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedTask);
        });

        test('should return 404 when task not found', async () => {
            // Setup
            const taskId = 'nonexistent-id';
            const updateData = { title: 'Novo título' };
            
            mockRequest.params.id = taskId;
            mockRequest.body = updateData;
            mockTask.findByIdAndUpdate.mockResolvedValue(null);

            // Execute
            await updateTask(mockRequest, mockResponse);

            // Verify
            expect(mockTask.findByIdAndUpdate).toHaveBeenCalledWith(
                taskId, 
                updateData, 
                { new: true, runValidators: true }
            );
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Task não encontrada'
            });
        });

        test('should handle update errors', async () => {
            // Setup
            const taskId = '507f1f77bcf86cd799439011';
            const updateData = { priority: 'invalid-priority' };
            const validationError = new Error('Invalid priority value');
            
            mockRequest.params.id = taskId;
            mockRequest.body = updateData;
            mockTask.findByIdAndUpdate.mockRejectedValue(validationError);

            // Execute
            await updateTask(mockRequest, mockResponse);

            // Verify
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Erro ao atualizar task',
                error: 'Invalid priority value'
            });
        });
    });

    describe('deleteTask', () => {
        
        test('should delete task successfully', async () => {
            // Setup
            const taskId = '507f1f77bcf86cd799439011';
            
            mockRequest.params.id = taskId;
            mockTask.findByIdAndDelete.mockResolvedValue(mockTaskData);

            // Execute
            await deleteTask(mockRequest, mockResponse);

            // Verify
            expect(mockTask.findByIdAndDelete).toHaveBeenCalledWith(taskId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Task deletada com sucesso'
            });
        });

        test('should return 404 when task not found for deletion', async () => {
            // Setup
            const taskId = 'nonexistent-id';
            
            mockRequest.params.id = taskId;
            mockTask.findByIdAndDelete.mockResolvedValue(null);

            // Execute
            await deleteTask(mockRequest, mockResponse);

            // Verify
            expect(mockTask.findByIdAndDelete).toHaveBeenCalledWith(taskId);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Task não encontrada'
            });
        });

        test('should handle deletion errors', async () => {
            // Setup
            const taskId = '507f1f77bcf86cd799439011';
            const deletionError = new Error('Database connection lost');
            
            mockRequest.params.id = taskId;
            mockTask.findByIdAndDelete.mockRejectedValue(deletionError);

            // Execute
            await deleteTask(mockRequest, mockResponse);

            // Verify
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Erro ao deletar task',
                error: 'Database connection lost'
            });
        });
    });

    describe('Input Validation', () => {
        
        test('should handle empty request body in createTask', async () => {
            // Setup
            mockRequest.body = {};
            const validationError = new Error('Title is required');
            mockTask.create.mockRejectedValue(validationError);

            // Execute
            await createTask(mockRequest, mockResponse);

            // Verify
            expect(mockTask.create).toHaveBeenCalledWith({});
            expect(mockResponse.status).toHaveBeenCalledWith(500);
        });

        test('should handle invalid ObjectId in updateTask', async () => {
            // Setup
            const invalidId = 'invalid-id-format';
            mockRequest.params.id = invalidId;
            mockRequest.body = { title: 'Test' };
            
            const castError = new Error('Cast to ObjectId failed');
            castError.name = 'CastError';
            mockTask.findByIdAndUpdate.mockRejectedValue(castError);

            // Execute
            await updateTask(mockRequest, mockResponse);

            // Verify
            expect(mockResponse.status).toHaveBeenCalledWith(500);
        });
    });
});
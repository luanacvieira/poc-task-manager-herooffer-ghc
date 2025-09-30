const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Task = require('../../src/models/taskModel');

// Criar instância do app para testes
let server;

beforeAll(async () => {
    // Aguardar conexão com banco de teste
    await new Promise((resolve) => {
        if (mongoose.connection.readyState === 1) {
            resolve();
        } else {
            mongoose.connection.once('open', resolve);
        }
    });
});

afterAll(async () => {
    if (server) {
        server.close();
    }
});

describe.skip('Task API Integration Tests (disabled - foco atual em testes unitários/mocks)', () => {
    
    beforeEach(async () => {
        // Limpar banco antes de cada teste
        await Task.deleteMany({});
    });
    
    describe('GET /api/tasks', () => {
        it('should return empty array when no tasks exist', async () => {
            const response = await request(app)
                .get('/api/tasks')
                .expect(200);
                
            expect(response.body).toEqual([]);
        });
        
        it('should return all tasks in descending order by creation date', async () => {
            // Criar algumas tarefas de teste
            const task1 = new Task({
                title: 'First Task',
                userId: 'user123',
                assignedTo: 'user123'
            });
            await task1.save();
            
            // Aguardar 1ms para garantir timestamp diferente
            await new Promise(resolve => setTimeout(resolve, 1));
            
            const task2 = new Task({
                title: 'Second Task',
                userId: 'user123',
                assignedTo: 'user123',
                priority: 'high'
            });
            await task2.save();
            
            const response = await request(app)
                .get('/api/tasks')
                .expect(200);
                
            expect(response.body).toHaveLength(2);
            expect(response.body[0].title).toBe('Second Task'); // Mais recente primeiro
            expect(response.body[1].title).toBe('First Task');
        });
        
        it('should return tasks with all fields populated', async () => {
            const taskData = {
                title: 'Complete Task',
                description: 'Task with all fields',
                userId: 'user123',
                assignedTo: 'user123',
                priority: 'urgent',
                category: 'work',
                tags: ['important', 'deadline'],
                dueDate: new Date('2025-12-31')
            };
            
            const task = new Task(taskData);
            await task.save();
            
            const response = await request(app)
                .get('/api/tasks')
                .expect(200);
                
            const returnedTask = response.body[0];
            expect(returnedTask.title).toBe(taskData.title);
            expect(returnedTask.description).toBe(taskData.description);
            expect(returnedTask.priority).toBe(taskData.priority);
            expect(returnedTask.category).toBe(taskData.category);
            expect(returnedTask.tags).toEqual(taskData.tags);
            expect(returnedTask.completed).toBe(false);
            expect(returnedTask._id).toBeDefined();
            expect(returnedTask.createdAt).toBeDefined();
            expect(returnedTask.updatedAt).toBeDefined();
        });
    });
    
    describe('POST /api/tasks', () => {
        it('should create a new task with minimal data', async () => {
            const taskData = {
                title: 'New Task',
                userId: 'user123',
                assignedTo: 'user123'
            };
            
            const response = await request(app)
                .post('/api/tasks')
                .send(taskData)
                .expect(201);
                
            expect(response.body.title).toBe(taskData.title);
            expect(response.body.userId).toBe(taskData.userId);
            expect(response.body.assignedTo).toBe(taskData.assignedTo);
            expect(response.body.completed).toBe(false);
            expect(response.body.priority).toBe('medium');
            expect(response.body.category).toBe('other');
            expect(response.body._id).toBeDefined();
            
            // Verificar se foi salvo no banco
            const taskInDb = await Task.findById(response.body._id);
            expect(taskInDb).toBeTruthy();
            expect(taskInDb.title).toBe(taskData.title);
        });
        
        it('should create task with all optional fields', async () => {
            const taskData = {
                title: 'Complete Task',
                description: 'Task with all fields',
                userId: 'user123',
                assignedTo: 'user123',
                priority: 'high',
                category: 'personal',
                tags: ['tag1', 'tag2'],
                dueDate: '2025-12-31T23:59:59.999Z',
                completed: true
            };
            
            const response = await request(app)
                .post('/api/tasks')
                .send(taskData)
                .expect(201);
                
            expect(response.body.title).toBe(taskData.title);
            expect(response.body.description).toBe(taskData.description);
            expect(response.body.priority).toBe(taskData.priority);
            expect(response.body.category).toBe(taskData.category);
            expect(response.body.tags).toEqual(taskData.tags);
            expect(response.body.completed).toBe(taskData.completed);
        });
        
        it('should return 400 for missing required fields', async () => {
            const invalidTaskData = {
                description: 'Task without title'
            };
            
            const response = await request(app)
                .post('/api/tasks')
                .send(invalidTaskData)
                .expect(400);
                
            expect(response.body.error).toBe('Failed to create task');
            expect(response.body.details).toBeDefined();
        });
        
        it('should return 400 for invalid priority', async () => {
            const taskData = {
                title: 'Invalid Task',
                userId: 'user123',
                assignedTo: 'user123',
                priority: 'invalid_priority'
            };
            
            await request(app)
                .post('/api/tasks')
                .send(taskData)
                .expect(400);
        });
        
        it('should return 400 for invalid category', async () => {
            const taskData = {
                title: 'Invalid Task',
                userId: 'user123',
                assignedTo: 'user123',
                category: 'invalid_category'
            };
            
            await request(app)
                .post('/api/tasks')
                .send(taskData)
                .expect(400);
        });
    });
    
    describe('PUT /api/tasks/:id', () => {
        let existingTask;
        
        beforeEach(async () => {
            existingTask = new Task({
                title: 'Existing Task',
                userId: 'user123',
                assignedTo: 'user123',
                completed: false
            });
            await existingTask.save();
        });
        
        it('should update task successfully', async () => {
            const updateData = {
                title: 'Updated Task',
                completed: true,
                priority: 'high'
            };
            
            const response = await request(app)
                .put(`/api/tasks/${existingTask._id}`)
                .send(updateData)
                .expect(200);
                
            expect(response.body.title).toBe(updateData.title);
            expect(response.body.completed).toBe(updateData.completed);
            expect(response.body.priority).toBe(updateData.priority);
            
            // Verificar no banco
            const updatedTask = await Task.findById(existingTask._id);
            expect(updatedTask.title).toBe(updateData.title);
            expect(updatedTask.completed).toBe(updateData.completed);
        });
        
        it('should return 404 for non-existent task', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .put(`/api/tasks/${nonExistentId}`)
                .send({ completed: true })
                .expect(404);
                
            expect(response.body.error).toBe('Task not found');
        });
        
        it('should return 400 for invalid task ID', async () => {
            await request(app)
                .put('/api/tasks/invalid_id')
                .send({ completed: true })
                .expect(400);
        });
        
        it('should validate updated fields', async () => {
            const invalidUpdate = {
                priority: 'invalid_priority'
            };
            
            await request(app)
                .put(`/api/tasks/${existingTask._id}`)
                .send(invalidUpdate)
                .expect(400);
        });
    });
    
    describe('DELETE /api/tasks/:id', () => {
        let existingTask;
        
        beforeEach(async () => {
            existingTask = new Task({
                title: 'Task to Delete',
                userId: 'user123',
                assignedTo: 'user123'
            });
            await existingTask.save();
        });
        
        it('should delete task successfully', async () => {
            await request(app)
                .delete(`/api/tasks/${existingTask._id}`)
                .expect(204);
                
            // Verificar se foi removido do banco
            const deletedTask = await Task.findById(existingTask._id);
            expect(deletedTask).toBeNull();
        });
        
        it('should return 404 for non-existent task', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .delete(`/api/tasks/${nonExistentId}`)
                .expect(404);
                
            expect(response.body.error).toBe('Task not found');
        });
        
        it('should return 400 for invalid task ID', async () => {
            await request(app)
                .delete('/api/tasks/invalid_id')
                .expect(400);
        });
    });
    
    describe('CORS and Headers', () => {
        it('should include CORS headers in response', async () => {
            const response = await request(app)
                .get('/api/tasks')
                .expect(200);
                
            expect(response.headers['access-control-allow-origin']).toBe('*');
        });
        
        it('should handle OPTIONS preflight requests', async () => {
            await request(app)
                .options('/api/tasks')
                .expect(200);
        });
    });
    
    describe('Error Handling', () => {
        it('should handle malformed JSON in request body', async () => {
            await request(app)
                .post('/api/tasks')
                .type('json')
                .send('{"invalid": json}')
                .expect(400);
        });
    });
});
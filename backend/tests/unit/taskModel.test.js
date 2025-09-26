const mongoose = require('mongoose');
const Task = require('../../src/models/taskModel');

describe('Task Model Unit Tests', () => {
    
    describe('Schema Validation', () => {
        it('should create a valid task with required fields', async () => {
            const validTask = {
                title: 'Test Task',
                userId: 'user123',
                assignedTo: 'user123'
            };
            
            const task = new Task(validTask);
            const savedTask = await task.save();
            
            expect(savedTask._id).toBeDefined();
            expect(savedTask.title).toBe('Test Task');
            expect(savedTask.completed).toBe(false); // default value
            expect(savedTask.priority).toBe('medium'); // default value
            expect(savedTask.category).toBe('other'); // default value
            expect(savedTask.createdAt).toBeDefined();
            expect(savedTask.updatedAt).toBeDefined();
        });
        
        it('should fail validation when required fields are missing', async () => {
            const invalidTask = new Task({});
            
            let error;
            try {
                await invalidTask.save();
            } catch (err) {
                error = err;
            }
            
            expect(error).toBeDefined();
            expect(error.errors.title).toBeDefined();
            expect(error.errors.userId).toBeDefined();
            expect(error.errors.assignedTo).toBeDefined();
        });
        
        it('should validate priority enum values', async () => {
            const taskWithInvalidPriority = new Task({
                title: 'Test Task',
                userId: 'user123',
                assignedTo: 'user123',
                priority: 'invalid_priority'
            });
            
            let error;
            try {
                await taskWithInvalidPriority.save();
            } catch (err) {
                error = err;
            }
            
            expect(error).toBeDefined();
            expect(error.errors.priority).toBeDefined();
        });
        
        it('should validate category enum values', async () => {
            const taskWithInvalidCategory = new Task({
                title: 'Test Task',
                userId: 'user123',
                assignedTo: 'user123',
                category: 'invalid_category'
            });
            
            let error;
            try {
                await taskWithInvalidCategory.save();
            } catch (err) {
                error = err;
            }
            
            expect(error).toBeDefined();
            expect(error.errors.category).toBeDefined();
        });
        
        it('should accept valid priority values', async () => {
            const priorities = ['low', 'medium', 'high', 'urgent'];
            
            for (const priority of priorities) {
                const task = new Task({
                    title: `Test Task - ${priority}`,
                    userId: 'user123',
                    assignedTo: 'user123',
                    priority
                });
                
                const savedTask = await task.save();
                expect(savedTask.priority).toBe(priority);
            }
        });
        
        it('should accept valid category values', async () => {
            const categories = ['work', 'personal', 'study', 'health', 'other'];
            
            for (const category of categories) {
                const task = new Task({
                    title: `Test Task - ${category}`,
                    userId: 'user123',
                    assignedTo: 'user123',
                    category
                });
                
                const savedTask = await task.save();
                expect(savedTask.category).toBe(category);
            }
        });
        
        it('should handle optional fields correctly', async () => {
            const taskWithOptionalFields = new Task({
                title: 'Test Task with Optional Fields',
                description: 'Test description',
                userId: 'user123',
                assignedTo: 'user123',
                dueDate: new Date('2025-12-31'),
                tags: ['tag1', 'tag2', 'tag3']
            });
            
            const savedTask = await taskWithOptionalFields.save();
            
            expect(savedTask.description).toBe('Test description');
            expect(savedTask.dueDate).toEqual(new Date('2025-12-31'));
            expect(savedTask.tags).toEqual(['tag1', 'tag2', 'tag3']);
        });
        
        it('should set default values for empty description and tags', async () => {
            const task = new Task({
                title: 'Test Task',
                userId: 'user123',
                assignedTo: 'user123'
            });
            
            const savedTask = await task.save();
            
            expect(savedTask.description).toBe('');
            expect(savedTask.tags).toEqual([]);
        });
    });
    
    describe('Model Methods', () => {
        it('should update timestamps automatically', async () => {
            const task = new Task({
                title: 'Test Task',
                userId: 'user123',
                assignedTo: 'user123'
            });
            
            const savedTask = await task.save();
            const originalUpdatedAt = savedTask.updatedAt;
            
            // Esperar 1ms para garantir timestamp diferente
            await new Promise(resolve => setTimeout(resolve, 1));
            
            savedTask.title = 'Updated Title';
            const updatedTask = await savedTask.save();
            
            expect(updatedTask.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        });
        
        it('should handle task completion toggle', async () => {
            const task = new Task({
                title: 'Test Task',
                userId: 'user123',
                assignedTo: 'user123'
            });
            
            const savedTask = await task.save();
            expect(savedTask.completed).toBe(false);
            
            savedTask.completed = true;
            const updatedTask = await savedTask.save();
            expect(updatedTask.completed).toBe(true);
        });
    });
});
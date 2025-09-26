const request = require('supertest');
const express = require('express');

// Mock dos controllers antes de importar as rotas
jest.mock('../../src/controllers/taskController', () => ({
    getTasks: jest.fn((req, res) => res.status(200).json([])),
    createTask: jest.fn((req, res) => res.status(201).json({})),
    updateTask: jest.fn((req, res) => res.status(200).json({ updated: true })),
    deleteTask: jest.fn((req, res) => res.status(204).send())
}));

const taskController = require('../../src/controllers/taskController');
const taskRoutes = require('../../src/routes/taskRoutes');

describe('Task Routes mapping', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api', taskRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/tasks chama getTasks', async () => {
        await request(app).get('/api/tasks').expect(200);
        expect(taskController.getTasks).toHaveBeenCalledTimes(1);
    });

    test('POST /api/tasks chama createTask', async () => {
        await request(app).post('/api/tasks').send({ title: 'X' }).expect(201);
        expect(taskController.createTask).toHaveBeenCalledTimes(1);
        expect(taskController.createTask.mock.calls[0][0].body.title).toBe('X');
    });

    test('PUT /api/tasks/:id chama updateTask', async () => {
        await request(app).put('/api/tasks/123').send({ done: true }).expect(200);
        expect(taskController.updateTask).toHaveBeenCalledTimes(1);
        expect(taskController.updateTask.mock.calls[0][0].params.id).toBe('123');
    });

    test('DELETE /api/tasks/:id chama deleteTask', async () => {
        await request(app).delete('/api/tasks/abc').expect(204);
        expect(taskController.deleteTask).toHaveBeenCalledTimes(1);
        expect(taskController.deleteTask.mock.calls[0][0].params.id).toBe('abc');
    });
});

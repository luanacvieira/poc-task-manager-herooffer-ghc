const request = require('supertest');
const express = require('express');

// Mock do rate limiter para não interferir nos testes / não exigir dependência real em unit
jest.mock('express-rate-limit', () => () => (req, res, next) => next());

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
        const validId = '507f1f77bcf86cd799439011';
        await request(app).put(`/api/tasks/${validId}`).send({ done: true }).expect(200);
        expect(taskController.updateTask).toHaveBeenCalledTimes(1);
        expect(taskController.updateTask.mock.calls[0][0].params.id).toBe(validId);
    });

    test('DELETE /api/tasks/:id chama deleteTask', async () => {
        const validId = '507f1f77bcf86cd799439012';
        await request(app).delete(`/api/tasks/${validId}`).expect(204);
        expect(taskController.deleteTask).toHaveBeenCalledTimes(1);
        expect(taskController.deleteTask.mock.calls[0][0].params.id).toBe(validId);
    });

    test('PUT /api/tasks/:id id inválido ainda passa (controller mockado) - validação real é no controller não neste teste', async () => {
        await request(app).put('/api/tasks/short').send({ done: true }).expect(200);
        // mapping garante chamada independente da validade do id pois estamos mockando controller
        expect(taskController.updateTask).toHaveBeenCalled();
    });

    test('DELETE /api/tasks/:id id inválido mapping', async () => {
        await request(app).delete('/api/tasks/xyz').expect(204);
        expect(taskController.deleteTask).toHaveBeenCalled();
    });
});

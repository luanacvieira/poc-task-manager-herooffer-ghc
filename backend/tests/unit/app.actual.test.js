const request = require('supertest');
const app = require('../../src/app');

// Mock taskController to avoid database dependencies
jest.mock('../../src/controllers/taskController', () => ({
    getTasks: jest.fn((req, res) => res.json([])),
    createTask: jest.fn((req, res) => res.json({ id: '1', title: 'Test' })),
    updateTask: jest.fn((req, res) => res.json({ id: '1', title: 'Updated' })),
    deleteTask: jest.fn((req, res) => res.json({ message: 'Deleted' }))
}));

describe('App Configuration', () => {
    describe('Health Endpoint', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
            
            expect(response.body).toEqual({ status: 'ok' });
        });
    });

    describe('CORS Configuration', () => {
        it('should have CORS enabled', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
            
            expect(response.headers['access-control-allow-origin']).toBe('*');
        });
    });

    describe('JSON Middleware', () => {
        it('should parse JSON requests', async () => {
            const response = await request(app)
                .post('/api/tasks')
                .send({ title: 'Test Task', description: 'Test' })
                .expect('Content-Type', /json/);
            
            expect(response.status).toBe(200);
        });
    });

    describe('Route Mounting', () => {
        it('should mount API routes under /api', async () => {
            const response = await request(app)
                .get('/api/tasks');
            
            expect(response.status).toBe(200);
        });
    });

    describe('Express App Instance', () => {
        it('should be an Express app', () => {
            expect(app).toBeDefined();
            expect(typeof app).toBe('function');
            expect(app._router).toBeDefined();
        });
    });
});
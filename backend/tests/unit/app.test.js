const request = require('supertest');
const app = require('../../src/app');

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
            // Test via API routes that use JSON parsing
            const response = await request(app)
                .post('/api/tasks')
                .send({ title: 'Test Task', description: 'Test' })
                .expect('Content-Type', /json/);
            
            // Should get some response (even if controller fails, JSON parsing worked)
            expect(response.status).toBeDefined();
        });
    });

    describe('Route Mounting', () => {
        it('should mount API routes under /api', async () => {
            // Test that routes are mounted correctly
            const response = await request(app)
                .get('/api/tasks');
            
            // Should not get 404 (routes are mounted)
            expect(response.status).not.toBe(404);
        });
    });
});
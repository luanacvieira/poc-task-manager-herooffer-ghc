
const request = require('supertest');
const app = require('../src/app');

describe('Task API', () => {
    it('should fetch tasks', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toEqual(200);
    });
});

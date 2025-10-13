const request = require('supertest');
const app = require('../../src/app');
const Task = require('../../src/models/taskModel');

describe('Extra Coverage: Task Controller', () => {
  describe('POST /tasks', () => {
    it('deve retornar 400 se o título estiver ausente', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ description: 'Sem título' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Title is required/);
    });
    it('deve criar tarefa com campos mínimos', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Nova tarefa' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Nova tarefa');
    });
  });

  describe('PUT /tasks/:id', () => {
    it('deve retornar 400 para id inválido', async () => {
      const res = await request(app)
        .put('/tasks/123')
        .send({ title: 'Update' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid task id/);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('deve retornar 400 para id inválido', async () => {
      const res = await request(app)
        .delete('/tasks/123')
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid task id/);
    });
  });
});

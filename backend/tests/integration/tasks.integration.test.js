const request = require('supertest');
const { app } = require('../setup-integration');
const mongoose = require('mongoose');
const Task = require('../../src/models/taskModel');

describe('Tasks Integration API', () => {
  test('POST /api/tasks cria task e GET /api/tasks retorna lista', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Integração',
        description: 'Teste',
        priority: 'high',
        category: 'work',
        tags: ['int'],
        assignedTo: 'user1',
        userId: 'user1'
      })
      .expect(201);

    expect(createRes.body._id).toBeDefined();

    const listRes = await request(app).get('/api/tasks').expect(200);
    expect(listRes.body.length).toBe(1);
    expect(listRes.body[0].title).toBe('Integração');
  });

  test('PUT /api/tasks/:id atualiza task e DELETE remove', async () => {
    const task = await Task.create({ title: 'Editar', assignedTo: 'u', userId: 'u' });

    const updateRes = await request(app)
      .put(`/api/tasks/${task._id}`)
      .send({ completed: true })
      .expect(200);
    expect(updateRes.body.completed).toBe(true);

    await request(app).delete(`/api/tasks/${task._id}`).expect(204);
    const after = await Task.findById(task._id);
    expect(after).toBeNull();
  });

  test('PUT task inexistente retorna 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .put(`/api/tasks/${fakeId}`)
      .send({ title: 'x' })
      .expect(404);
  });
});
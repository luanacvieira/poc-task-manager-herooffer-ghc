const taskController = require('../../src/controllers/taskController');
const Task = require('../../src/models/taskModel');

jest.mock('../../src/models/taskModel');

describe('Task Controller (real functions with mocked model)', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() };
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
    jest.clearAllMocks();
  });

  test('getTasks success', async () => {
    const tasks = [{ _id: '1', title: 'A', createdAt: new Date() }];
    Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(tasks) });
    await taskController.getTasks(req, res);
    expect(res.json).toHaveBeenCalledWith(tasks);
  });

  test('getTasks error', async () => {
    const err = new Error('boom');
    Task.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(err) });
    await taskController.getTasks(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('createTask success', async () => {
    req.body = { title: 'New', assignedTo: 'u', userId: 'u' };
    const saved = { _id: 'x', ...req.body };
    const save = jest.fn().mockResolvedValue(saved);
    Task.mockImplementation(() => ({ save }));
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(saved);
  });

  test('createTask validation error', async () => {
    req.body = { title: '' };
    const err = new Error('validation');
    const save = jest.fn().mockRejectedValue(err);
    Task.mockImplementation(() => ({ save }));
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateTask success', async () => {
    req.params.id = '1';
    req.body = { completed: true };
    const updated = { _id: '1', completed: true };
    Task.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);
    await taskController.updateTask(req, res);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('updateTask not found', async () => {
    req.params.id = '1';
    Task.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updateTask error', async () => {
    req.params.id = '1';
    const err = new Error('fail');
    Task.findByIdAndUpdate = jest.fn().mockRejectedValue(err);
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('deleteTask success', async () => {
    req.params.id = '1';
    Task.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: '1' });
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test('deleteTask not found', async () => {
    req.params.id = '1';
    Task.findByIdAndDelete = jest.fn().mockResolvedValue(null);
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deleteTask error', async () => {
    req.params.id = '1';
    Task.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('err'));
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

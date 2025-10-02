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

  test('createTask com todos os campos válidos mantém valores informados', async () => {
    req.body = {
      title: 'Task Completa',
      description: 'Desc',
      priority: 'urgent',
      dueDate: '2025-12-31',
      category: 'work',
      tags: ['a','b'],
      completed: true,
      assignedTo: 'userX',
      userId: 'userX'
    };
    const saved = { _id: 'id-full', ...req.body };
    const save = jest.fn().mockResolvedValue(saved);
    Task.mockImplementation(() => ({ save }));
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(saved);
  });

  test('createTask aplica defaults e sanitiza campos inválidos', async () => {
    req.body = {
      title: '  Trim  ',
      description: 123,               // vira ''
      priority: 'invalid',             // fallback medium
      dueDate: null,                   // vira null
      category: 42,                    // fallback other
      tags: ['ok', 1, null, 'z'],      // filtra não strings
      completed: 'yes',                // !! => true
      assignedTo: 999,                 // fallback user1
      userId: null                     // fallback user1
    };
    const expected = {
      _id: 'id-sanitized',
      title: 'Trim',
      description: '',
      priority: 'medium',
      dueDate: null,
      category: 'other',
      tags: ['ok','z'],
      completed: true,
      assignedTo: 'user1',
      userId: 'user1'
    };
    const save = jest.fn().mockResolvedValue(expected);
    Task.mockImplementation(() => ({ save }));
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expected);
  });

  test('updateTask success', async () => {
    // Use valid 24-char hex ObjectId to pass controller regex
    req.params.id = '507f1f77bcf86cd799439011';
    req.body = { completed: true };
    const updated = { _id: req.params.id, completed: true };
    Task.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);
    await taskController.updateTask(req, res);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('updateTask not found', async () => {
    req.params.id = '507f1f77bcf86cd799439012';
    Task.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updateTask error', async () => {
    req.params.id = '507f1f77bcf86cd799439013';
    const err = new Error('fail');
    Task.findByIdAndUpdate = jest.fn().mockRejectedValue(err);
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateTask com todos os campos permitidos', async () => {
    req.params.id = '507f1f77bcf86cd799439099';
    req.body = {
      title: 'Novo',
      description: 'Desc',
      priority: 'high',
      dueDate: '2026-01-01',
      category: 'study',
      tags: ['t1','t2'],
      completed: true,
      ignorar: 'x' // não deve ir para update
    };
    const updated = { _id: req.params.id, ...req.body };
    delete updated.ignorar;
    Task.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);
    await taskController.updateTask(req, res);
    expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.id,
      {
        title: 'Novo',
        description: 'Desc',
        priority: 'high',
        dueDate: '2026-01-01',
        category: 'study',
        tags: ['t1','t2'],
        completed: true
      },
      { new: true, runValidators: true }
    );
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('updateTask invalid id format => 400', async () => {
    req.params.id = '1'; // invalid length
    req.body = { completed: true };
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid task id' });
  });

  test('deleteTask success', async () => {
    req.params.id = '507f1f77bcf86cd799439014';
    Task.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: req.params.id });
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test('deleteTask not found', async () => {
    req.params.id = '507f1f77bcf86cd799439015';
    Task.findByIdAndDelete = jest.fn().mockResolvedValue(null);
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deleteTask error', async () => {
    req.params.id = '507f1f77bcf86cd799439016';
    Task.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('err'));
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('deleteTask invalid id format => 400', async () => {
    req.params.id = 'short';
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid task id' });
  });
});

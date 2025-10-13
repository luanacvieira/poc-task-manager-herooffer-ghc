jest.mock('../src/models/taskModel', () => {
  const staticMocks = {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  };
  let nextSaveImpl = null;
  function setNextSaveImpl(fn) { nextSaveImpl = fn; }
  function MockTask(doc) {
    return {
      ...doc,
      save: jest.fn(() => {
        if (nextSaveImpl) return nextSaveImpl(doc);
        return { ...doc, _id: 'generated-id' };
      })
    };
  }
  Object.assign(MockTask, staticMocks, { setNextSaveImpl });
  return MockTask;
});

const taskController = require('../src/controllers/taskController');
const Task = require('../src/models/taskModel');

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.status = jest.fn(code => { res.statusCode = code; return res; });
  res.jsonData = undefined;
  res.json = jest.fn(data => { res.jsonData = data; return res; });
  res.sent = false;
  res.send = jest.fn(() => { res.sent = true; return res; });
  return res;
}

describe('taskController coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Task.setNextSaveImpl(null);
  });

  // getTasks
  test('getTasks success', async () => {
    const tasksMock = [{ _id: '1' }, { _id: '2' }];
    Task.find.mockReturnValue({ sort: jest.fn(() => tasksMock) });
    const req = {}; const res = mockRes();
    await taskController.getTasks(req, res);
    expect(res.jsonData).toEqual(tasksMock);
  });

  test('getTasks error', async () => {
    Task.find.mockImplementation(() => { throw new Error('fail find'); });
    const req = {}; const res = mockRes();
    await taskController.getTasks(req, res);
    expect(res.statusCode).toBe(500);
  });

  // createTask validation error (title missing)
  test('createTask validation error missing title', async () => {
    const req = { body: {} };
    const res = mockRes();
    await taskController.createTask(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.jsonData.error).toBe('Title is required');
  });

  // createTask success
  test('createTask success', async () => {
    const req = { body: { title: 'Task A', priority: 'high' } };
    Task.setNextSaveImpl(() => ({ _id: 'ok-id', title: 'Task A' }));
    const res = mockRes();
    await taskController.createTask(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.jsonData._id).toBe('ok-id');
  });

  // createTask save error -> catch block fallback
  test('createTask save error fallback', async () => {
    const req = { body: { title: 'X' } };
    Task.setNextSaveImpl(() => { throw new Error('save err'); });
    const res = mockRes();
    await taskController.createTask(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.jsonData._id).toBe('mock-bypass-id');
  });

  // updateTask invalid id
  test('updateTask invalid id', async () => {
    const req = { params: { id: '123' }, body: {} };
    const res = mockRes();
    await taskController.updateTask(req, res);
    expect(res.statusCode).toBe(400);
  });

  // updateTask not found
  test('updateTask not found', async () => {
    Task.findByIdAndUpdate.mockResolvedValue(null);
    const req = { params: { id: 'a'.repeat(24) }, body: { title: 'T' } };
    const res = mockRes();
    await taskController.updateTask(req, res);
    expect(res.statusCode).toBe(404);
  });

  // updateTask success
  test('updateTask success', async () => {
    const updated = { _id: 'u1', title: 'New' };
    Task.findByIdAndUpdate.mockResolvedValue(updated);
    const req = { params: { id: 'b'.repeat(24) }, body: { title: 'New', completed: true } };
    const res = mockRes();
    await taskController.updateTask(req, res);
    expect(res.jsonData).toEqual(updated);
  });

  // updateTask error (throws)
  test('updateTask error thrown', async () => {
    Task.findByIdAndUpdate.mockImplementation(() => { throw new Error('upd fail'); });
    const req = { params: { id: 'c'.repeat(24) }, body: { title: 'X' } };
    const res = mockRes();
    await taskController.updateTask(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.jsonData.error).toBe('Failed to update task');
  });

  // deleteTask invalid id
  test('deleteTask invalid id', async () => {
    const req = { params: { id: 'zzz' } };
    const res = mockRes();
    await taskController.deleteTask(req, res);
    expect(res.statusCode).toBe(400);
  });

  // deleteTask not found
  test('deleteTask not found', async () => {
    Task.findByIdAndDelete.mockResolvedValue(null);
    const req = { params: { id: 'd'.repeat(24) } };
    const res = mockRes();
    await taskController.deleteTask(req, res);
    expect(res.statusCode).toBe(404);
  });

  // deleteTask success
  test('deleteTask success', async () => {
    Task.findByIdAndDelete.mockResolvedValue({ _id: 'del1' });
    const req = { params: { id: 'e'.repeat(24) } };
    const res = mockRes();
    await taskController.deleteTask(req, res);
    expect(res.statusCode).toBe(204);
    expect(res.sent).toBe(true);
  });

  // deleteTask error
  test('deleteTask error thrown', async () => {
    Task.findByIdAndDelete.mockImplementation(() => { throw new Error('del fail'); });
    const req = { params: { id: 'f'.repeat(24) } };
    const res = mockRes();
    await taskController.deleteTask(req, res);
    expect(res.statusCode).toBe(500);
  });
});

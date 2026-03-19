/**
 * Mock server — roda sem MongoDB (dados em memória).
 * Use: npm run dev:mock
 */
const express = require('express');

const app = express();

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// In-memory storage
let tasks = [
    { _id: '1', title: 'Tarefa de exemplo', completed: false, userId: 'user1' },
    { _id: '2', title: 'Revisar pull request', completed: true, userId: 'user1' }
];
let nextId = 3;

// GET /api/tasks
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// POST /api/tasks
app.post('/api/tasks', (req, res) => {
    const { title, completed = false, userId } = req.body;
    if (!title || !userId) {
        return res.status(400).json({ error: 'title e userId são obrigatórios' });
    }
    const task = { _id: String(nextId++), title, completed, userId };
    tasks.push(task);
    res.status(201).json(task);
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const before = tasks.length;
    tasks = tasks.filter(t => t._id !== id);
    if (tasks.length === before) {
        return res.status(404).json({ error: 'Task não encontrada' });
    }
    res.status(204).send();
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`[mock] Backend rodando em http://localhost:${PORT}`);
    console.log('  GET    /api/tasks');
    console.log('  POST   /api/tasks');
    console.log('  DELETE /api/tasks/:id');
});

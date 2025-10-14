const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task Manager Backend is running!' });
});

// Mock data para demonstração
let tasks = [
  {
    _id: '1',
    title: 'Tarefa de Exemplo',
    description: 'Esta é uma tarefa de exemplo',
    completed: false,
    priority: 'medium',
    category: 'work',
    tags: ['exemplo'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Routes
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  // Validação e sanitização para evitar object injection
  const { title, description, priority, category, tags, assignedTo, userId } = req.body;
  const task = {
    _id: (Math.random() * 1000000).toString(),
    title: title || '',
    description: description || '',
    priority: priority || 'medium',
    category: category || 'general',
    tags: Array.isArray(tags) ? tags : [],
    assignedTo: assignedTo || '',
    userId: userId || '',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t._id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  // Validação e sanitização para evitar object injection
  const { title, description, priority, category, tags, assignedTo, completed } = req.body;
  const updatedFields = {};
  
  if (title !== undefined) updatedFields.title = title;
  if (description !== undefined) updatedFields.description = description;
  if (priority !== undefined) updatedFields.priority = priority;
  if (category !== undefined) updatedFields.category = category;
  if (Array.isArray(tags)) updatedFields.tags = tags;
  if (assignedTo !== undefined) updatedFields.assignedTo = assignedTo;
  if (typeof completed === 'boolean') updatedFields.completed = completed;
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updatedFields,
    updatedAt: new Date()
  };
  
  res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t._id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`🚀 Mock Backend rodando na porta ${PORT}`);
  console.log(`📍 API disponível em: http://localhost:${PORT}/api/tasks`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
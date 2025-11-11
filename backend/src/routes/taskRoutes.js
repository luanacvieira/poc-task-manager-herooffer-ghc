
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const taskController = require('../controllers/taskController');

// GET all tasks with optional filters
router.get('/tasks', taskController.getTasks);

// GET task by ID
router.get('/tasks/:id', taskController.getTaskById);

// POST create new task
router.post('/tasks', taskController.createTask);

// PUT update task by ID
router.put('/tasks/:id', taskController.updateTask);

// PATCH toggle task completion
router.patch('/tasks/:id/toggle', taskController.toggleTaskCompletion);

// DELETE task by ID
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;

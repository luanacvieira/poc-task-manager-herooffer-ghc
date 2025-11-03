
const Task = require('../models/taskModel');

exports.getTasks = async (req, res) => {
    try {
        const { category, priority, completed, userId } = req.query;
        const filter = {};
        
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (completed !== undefined) filter.completed = completed === 'true';
        if (userId) filter.userId = userId;

        // Aplicar ordenação simples - MongoDB não aceita objetos complexos no sort
        const tasks = await Task.find(filter).sort({ 
            createdAt: -1 // Ordenar por data de criação (mais recente primeiro)
        });
        
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Failed to fetch task', details: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const taskData = {
            title: req.body.title,
            description: req.body.description || '',
            priority: req.body.priority || 'medium',
            dueDate: req.body.dueDate || null,
            category: req.body.category || 'work',
            tags: req.body.tags || [],
            assignedTo: req.body.assignedTo || '',
            userId: req.body.userId || 'default-user',
            completed: req.body.completed || false
        };

        const newTask = new Task(taskData);
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(400).json({ error: 'Failed to create task', details: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(400).json({ error: 'Failed to update task', details: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task', details: error.message });
    }
};

exports.toggleTaskCompletion = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        task.completed = !task.completed;
        await task.save();
        
        res.json(task);
    } catch (error) {
        console.error('Error toggling task completion:', error);
        res.status(500).json({ error: 'Failed to toggle task completion', details: error.message });
    }
};

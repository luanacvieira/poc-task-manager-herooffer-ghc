
const Task = require('../models/taskModel');

// GET /api/tasks — suporte a filtros via query string
// ?status=open&priority=high&category=work&sortBy=createdAt&order=desc
exports.getTasks = async (req, res) => {
    try {
        const { status, priority, category, sortBy = 'createdAt', order = 'desc' } = req.query;

        const filter = {};
        if (status)   filter.status   = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;

        const sortOrder = order === 'asc' ? 1 : -1;
        const allowedSort = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'];
        const sortField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

        const tasks = await Task.find(filter).sort({ [sortField]: sortOrder });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, category, dueDate, assignedTo, tags, userId } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'O campo título é obrigatório.' });
        }
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'O campo userId é obrigatório.' });
        }

        const newTask = new Task({
            title: title.trim(),
            description: description || '',
            status:      status      || 'open',
            priority:    priority    || 'medium',
            category:    category    || 'work',
            dueDate:     dueDate     || null,
            assignedTo:  assignedTo  || '',
            tags:        Array.isArray(tags) ? tags : [],
            completed:   status === 'done',
            userId:      userId.trim()
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create task', details: error.message });
    }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
    try {
        const { title, description, status, priority, category, dueDate, assignedTo, tags } = req.body;

        if (title !== undefined && !title.trim()) {
            return res.status(400).json({ error: 'O campo título não pode ser vazio.' });
        }

        const updateData = {};
        if (title       !== undefined) updateData.title       = title.trim();
        if (description !== undefined) updateData.description = description;
        if (status      !== undefined) { updateData.status = status; updateData.completed = status === 'done'; }
        if (priority    !== undefined) updateData.priority    = priority;
        if (category    !== undefined) updateData.category    = category;
        if (dueDate     !== undefined) updateData.dueDate     = dueDate || null;
        if (assignedTo  !== undefined) updateData.assignedTo  = assignedTo;
        if (tags        !== undefined) updateData.tags        = Array.isArray(tags) ? tags : [];

        const updated = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ error: 'Task não encontrada.' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update task', details: error.message });
    }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
    try {
        const deleted = await Task.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Task não encontrada.' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
};


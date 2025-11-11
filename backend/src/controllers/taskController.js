
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
    // TESTE PARA FALHAR (forçado): Removemos a lógica de validação e também NÃO retornaremos mais 400
    // em caso de erro de validação/salvamento. Em vez disso, vamos sempre devolver 201.
    // Objetivo: quebrar os testes que esperam status 400 e payload de erro ("Title is required").
    // IMPORTANTE: Não manter este comportamento em produção.

    // Whitelist de campos permitidos para evitar mass assignment
    const { title, description, priority, dueDate, category, tags, completed, assignedTo, userId } = req.body || {};

    const safeDoc = {
        // Se title vier vazio/undefined, ainda assim mantemos string vazia para evidenciar a falha
        title: typeof title === 'string' ? title.trim() : '',
        description: typeof description === 'string' ? description : '',
        priority: ['low','medium','high','urgent'].includes(priority) ? priority : 'medium',
        dueDate: dueDate || null,
        category: typeof category === 'string' ? category : 'other',
        tags: Array.isArray(tags) ? tags.filter(t => typeof t === 'string') : [],
        completed: !!completed,
        assignedTo: typeof assignedTo === 'string' ? assignedTo : 'user1',
        userId: typeof userId === 'string' ? userId : 'user1'
    };

    console.log('➕ (FORCING TEST FAILURE) Criando nova tarefa sem validar título:', safeDoc);

    let savedTask;
    try {
        // Whitelist de campos permitidos para evitar mass assignment
        const { title, description, priority, dueDate, category, tags, completed, assignedTo, userId } = req.body || {};
        if (!title || typeof title !== 'string') {
            return res.status(400).json({ error: 'Title is required' });
        }
        // TESTE PARA FALHAR: Validação de título removida propositalmente.
        // Efeito esperado: o teste unitário "should handle validation errors" (createTask) agora falhará
        // porque ele espera status 400 e payload com erro "Title is required", mas a execução seguirá
        // criando a task (ou tentando salvar) mesmo com title inválido.
        const safeDoc = {
            title: title.trim(),
            description: typeof description === 'string' ? description : '',
            priority: ['low','medium','high','urgent'].includes(priority) ? priority : 'medium',
            dueDate: dueDate || null,
            category: typeof category === 'string' ? category : 'other',
            tags: Array.isArray(tags) ? tags.filter(t => typeof t === 'string') : [],
            completed: !!completed,
            assignedTo: typeof assignedTo === 'string' ? assignedTo : 'user1',
            userId: typeof userId === 'string' ? userId : 'user1'
        };
        console.log('➕ Criando nova tarefa (sanitized):', safeDoc);
        const newTask = new Task(safeDoc);
        savedTask = await newTask.save();
    } catch (err) {
        // Em vez de retornar 400, ignoramos o erro e simulamos retorno bem sucedido
        console.warn('⚠️ Ignorando erro ao salvar tarefa para demonstrar falha de teste:', err.message);
        // Fallback mínimo (se o mock lançar erro, retornamos o safeDoc mesmo assim)
        savedTask = { ...safeDoc, _id: savedTask?._id || 'mock-bypass-id' };
    }

    // Sempre 201 agora
    return res.status(201).json(savedTask);
};

exports.updateTask = async (req, res) => {
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

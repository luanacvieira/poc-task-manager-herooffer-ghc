
const Task = require('../models/taskModel');

exports.getTasks = async (req, res) => {
    try {
        console.log('📄 Buscando todas as tarefas...');
        const tasks = await Task.find().sort({ createdAt: -1 });
        console.log(`✅ ${tasks.length} tarefas encontradas`);
        res.json(tasks);
    } catch (error) {
        console.error('❌ Erro ao buscar tarefas:', error.message);
        res.status(500).json({ error: 'Failed to fetch tasks' });
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
        const { id } = req.params;
        if (!id || !id.match(/^[a-fA-F0-9]{24}$/)) {
            return res.status(400).json({ error: 'Invalid task id' });
        }
        // Apenas campos permitidos (explicito para evitar dynamic property warnings de segurança)
        const update = {};
        if (Object.prototype.hasOwnProperty.call(req.body, 'title')) update.title = req.body.title;
        if (Object.prototype.hasOwnProperty.call(req.body, 'description')) update.description = req.body.description;
        if (Object.prototype.hasOwnProperty.call(req.body, 'priority')) update.priority = req.body.priority;
        if (Object.prototype.hasOwnProperty.call(req.body, 'dueDate')) update.dueDate = req.body.dueDate;
        if (Object.prototype.hasOwnProperty.call(req.body, 'category')) update.category = req.body.category;
        if (Object.prototype.hasOwnProperty.call(req.body, 'tags')) update.tags = req.body.tags;
        if (Object.prototype.hasOwnProperty.call(req.body, 'completed')) update.completed = req.body.completed;
        console.log('📝 Atualizando tarefa (safe fields):', id);
        const updatedTask = await Task.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(updatedTask);
    } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error.message);
        res.status(400).json({ error: 'Failed to update task', details: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !id.match(/^[a-fA-F0-9]{24}$/)) {
            return res.status(400).json({ error: 'Invalid task id' });
        }
        console.log('🗑️ Deletando tarefa');
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('❌ Erro ao deletar tarefa:', error.message);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

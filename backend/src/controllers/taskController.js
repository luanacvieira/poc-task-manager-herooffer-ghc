
const Task = require('../models/taskModel');

exports.getTasks = async (req, res) => {
    try {
        console.log('📄 Buscando todas as tarefas...');
        const tasks = await Task.find().sort({ createdAt: -1 }); // Mais recentes primeiro
        console.log(`✅ ${tasks.length} tarefas encontradas`);
        res.json(tasks);
    } catch (error) {
        console.error('❌ Erro ao buscar tarefas:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

exports.createTask = async (req, res) => {
    try {
        console.log('➕ Criando nova tarefa:', req.body);
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        console.log('✅ Tarefa criada com sucesso:', savedTask._id);
        res.status(201).json(savedTask);
    } catch (error) {
        console.error('❌ Erro ao criar tarefa:', error);
        res.status(400).json({ error: 'Failed to create task', details: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        console.log(`📝 Atualizando tarefa ${req.params.id}:`, req.body);
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        console.log('✅ Tarefa atualizada com sucesso');
        res.json(updatedTask);
    } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error);
        res.status(400).json({ error: 'Failed to update task', details: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        console.log(`🗑️ Deletando tarefa ${req.params.id}`);
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        console.log('✅ Tarefa deletada com sucesso');
        res.status(204).send();
    } catch (error) {
        console.error('❌ Erro ao deletar tarefa:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

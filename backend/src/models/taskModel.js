
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'urgent'], 
        default: 'medium' 
    },
    dueDate: { type: Date },
    category: { 
        type: String,
        enum: ['work', 'personal', 'study', 'health', 'other'],
        default: 'other'
    },
    tags: [{ type: String }],
    assignedTo: { type: String, required: true },
    userId: { type: String, required: true }
}, {
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Task', taskSchema);


const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxLength: 200
    },
    description: { 
        type: String, 
        default: '',
        trim: true,
        maxLength: 1000
    },
    completed: { 
        type: Boolean, 
        default: false 
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium' 
    },
    dueDate: { 
        type: Date,
        default: null
    },
    category: { 
        type: String, 
        enum: ['work', 'personal', 'study', 'health', 'shopping', 'other'],
        default: 'work' 
    },
    tags: [{ 
        type: String,
        trim: true,
        maxLength: 50
    }],
    assignedTo: { 
        type: String, 
        trim: true,
        default: ''
    },
    userId: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Middleware para atualizar updatedAt automaticamente
taskSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

taskSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.model('Task', taskSchema);


const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title:       { type: String,  required: true, trim: true, maxlength: 200 },
        description: { type: String,  default: '',    trim: true },
        status:      { type: String,  enum: ['open', 'in_progress', 'done'], default: 'open' },
        priority:    { type: String,  enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
        category:    { type: String,  enum: ['work', 'personal', 'bug', 'feature', 'other'], default: 'work' },
        dueDate:     { type: Date,    default: null },
        assignedTo:  { type: String,  default: '',   trim: true },
        tags:        { type: [String], default: [] },
        completed:   { type: Boolean, default: false },
        userId:      { type: String,  required: true, trim: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);


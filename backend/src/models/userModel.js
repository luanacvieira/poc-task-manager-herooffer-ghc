const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    department: { 
        type: String, 
        enum: ['engineering', 'marketing', 'sales', 'hr', 'finance', 'operations'],
        required: true 
    },
    role: { 
        type: String, 
        enum: ['junior', 'senior', 'lead', 'manager', 'director'],
        required: true 
    },
    salary: { 
        type: Number, 
        required: true 
    },
    manager: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null 
    },
    joinDate: { 
        type: Date, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    skills: [{ 
        type: String,
        trim: true 
    }],
    performance: {
        score: { type: Number, min: 1, max: 10, default: 5 },
        reviews: [{
            quarter: String,
            year: Number,
            rating: Number,
            feedback: String,
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reviewDate: { type: Date, default: Date.now }
        }]
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

userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('User', userSchema);
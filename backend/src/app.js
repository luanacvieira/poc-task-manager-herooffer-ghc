
const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// CORS middleware DEVE vir ANTES das rotas
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware
app.use(express.json());
app.use('/api', taskRoutes);

mongoose.connect('mongodb://localhost:27017/taskdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    const server = app.listen(3001, () => {
        console.log('Server running on port 3001');
        console.log('Available routes:');
        console.log('  GET /api/tasks');
        console.log('  POST /api/tasks');
        console.log('  PUT /api/tasks/:id');
        console.log('  DELETE /api/tasks/:id');
    });
    
    server.on('error', (err) => {
        console.error('Server error:', err);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions  
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

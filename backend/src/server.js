const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Healthcheck endpoint
app.get('/healthcheck', (req, res) => {
    res.status(200).json({ 
        message: 'API funcionando corretamente',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Middleware
app.use(express.json());
app.use('/api', taskRoutes);

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/taskdb');
        console.log('✓ Connected to MongoDB');
        
        const PORT = 3001;
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
            console.log('✓ Available routes:');
            console.log('  GET  /healthcheck');
            console.log('  GET  /api/tasks');
            console.log('  POST /api/tasks');
            console.log('  PUT  /api/tasks/:id');
            console.log('  PATCH /api/tasks/:id/toggle');
            console.log('  DELETE /api/tasks/:id');
            console.log('\n✓ Server is ready to accept connections\n');
        });

        server.on('error', (err) => {
            console.error('✗ Server error:', err);
            if (err.code === 'EADDRINUSE') {
                console.error(`✗ Port ${PORT} is already in use`);
                process.exit(1);
            }
        });

    } catch (err) {
        console.error('✗ Failed to start server:', err);
        process.exit(1);
    }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('✗ Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('✗ Uncaught Exception:', err);
});

startServer();

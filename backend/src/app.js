// Express app puro (sem side-effects de conexão) para facilitar testes unitários.
const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Crie um endpoint GET /healthcheck que retorne status 200 e mensagem "API funcionando corretamente

app.get('/healthcheck', (req, res) => {
    res.status(200).json({ message: 'API funcionando corretamente' });
});                                 


// Simple CORS middleware (deve vir antes das rotas)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Middleware
app.use(express.json());
app.use('/api', taskRoutes);

mongoose.connect('mongodb://localhost:27017/taskdb').then(() => {
    console.log('Connected to MongoDB');
    
    // Test immediate MongoDB operation
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB runtime error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
        console.error('MongoDB disconnected!');
    });
    
    const server = app.listen(3001, () => {
        console.log('Server running on port 3001');
        console.log('Available routes:');
        console.log('  GET /api/tasks');
        console.log('  POST /api/tasks');
        console.log('  DELETE /api/tasks/:id');
        console.log('Server is ready to accept connections');
    });
    
    server.on('error', (err) => {
        console.error('Server error:', err);
    });
    
    server.on('close', () => {
        console.log('Server closed');
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Não mata o processo, apenas loga o erro
});

// Handle uncaught exceptions  
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Não mata o processo, apenas loga o erro
});

// Prevent process from exiting
process.stdin.resume();

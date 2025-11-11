require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskdb';
const USE_INMEMORY = process.env.USE_INMEMORY === 'true';

let mongoServer;

async function start() {
    try {
        let uri = MONGO_URI;
        
        if (USE_INMEMORY) {
            console.log('🧠 Iniciando MongoDB em memória para desenvolvimento...');
            mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            console.log('📝 MongoDB em memória iniciado:', uri);
        }
        
        await mongoose.connect(uri, { });
        console.log('✅ Conectado ao MongoDB');
        
        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📍 API disponível em: http://localhost:${PORT}/api/tasks`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        });
        
        server.on('error', (err) => console.error('❌ Erro do servidor:', err));
    } catch (err) {
        console.error('❌ Erro de conexão MongoDB:', err);
        if (mongoServer) await mongoServer.stop();
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
    process.exit(0);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

start();
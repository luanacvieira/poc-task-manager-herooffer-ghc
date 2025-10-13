require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./app');

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/poc_task_manager';
const USE_FALLBACK = process.env.USE_FALLBACK !== 'false';

let mongoServer;

async function start() {
    try {
        // Tentar conectar ao MongoDB local primeiro
        console.log('🔄 Tentando conectar ao MongoDB local...');
        await mongoose.connect(MONGO_URI, { 
            serverSelectionTimeoutMS: 3000 // Timeout rápido para falhar rapidamente
        });
        console.log('✅ Conectado ao MongoDB local:', MONGO_URI);
        
    } catch (err) {
        console.log('❌ Falha na conexão MongoDB local:', err.message);
        
        if (USE_FALLBACK) {
            console.log('🧠 Iniciando MongoDB em memória como fallback...');
            try {
                mongoServer = await MongoMemoryServer.create();
                const memoryUri = mongoServer.getUri();
                await mongoose.connect(memoryUri, {});
                console.log('✅ Conectado ao MongoDB em memória:', memoryUri);
            } catch (memoryErr) {
                console.error('❌ Falha no MongoDB em memória:', memoryErr);
                process.exit(1);
            }
        } else {
            console.error('❌ Não foi possível conectar ao MongoDB e fallback está desabilitado');
            process.exit(1);
        }
    }

    const server = app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📍 API disponível em: http://localhost:${PORT}/api/tasks`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
    
    server.on('error', (err) => console.error('❌ Erro do servidor:', err));
}

// Global process handlers (uma vez só aqui)
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

start();
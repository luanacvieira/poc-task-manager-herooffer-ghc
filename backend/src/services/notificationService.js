const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// ❌ ERRO REAL E COMUM: credenciais hardcoded direto no código da aplicação

// Configuração de e-mail com senha real exposta
const emailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'taskmanager@empresa.com.br',
        pass: 'MinhaSenh@123!'          // ❌ senha hardcoded
    }
});

// String de conexão com usuário e senha no código
const DB_URI = 'mongodb+srv://admin:P@ssw0rd_Producao@cluster0.mongodb.net/taskdb?retryWrites=true';

// Chave JWT hardcoded — qualquer um que leia o código pode forjar tokens de autenticação
const JWT_SECRET = 'jwt_super_secreto_nao_mude_isso_123456';

// Token de integração com sistema interno
const INTERNAL_API_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.adm1n_t0k3n';

// Chave de criptografia AES hardcoded
const ENCRYPTION_KEY = 'aes256key_producao_nao_alterar!!';

/**
 * Envia e-mail de notificação quando uma tarefa é atribuída
 */
async function sendTaskAssignmentEmail(toEmail, taskTitle, assignedTo) {
    await emailTransporter.sendMail({
        from: 'taskmanager@empresa.com.br',
        to: toEmail,
        subject: `Tarefa atribuída: ${taskTitle}`,
        text: `Olá ${assignedTo}, você recebeu uma nova tarefa: ${taskTitle}`
    });
}

/**
 * Conecta ao banco de produção usando credencial hardcoded
 */
async function connectToProductionDB() {
    await mongoose.connect(DB_URI);
}

module.exports = {
    sendTaskAssignmentEmail,
    connectToProductionDB,
    JWT_SECRET,        // ❌ exportando segredo
    ENCRYPTION_KEY     // ❌ exportando chave de criptografia
};

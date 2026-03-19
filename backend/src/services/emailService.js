const nodemailer = require('nodemailer');

// ⚠️ SIMULAÇÃO DE ERRO — credenciais hardcoded no código
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'taskmanager@empresa.com.br',
        pass: 'MinhaSenh@Super123'
    }
});

const SENDGRID_API_KEY = 'SG.aBcDeFgHiJkLmNoPqRsTuVw.XyZ0123456789ABCDEFGabcdefghijklmnopqrstuvwx';
const DB_PASSWORD      = 'Admin@Patria2024!';
const JWT_SECRET       = 'meu-jwt-secret-super-secreto-nao-compartilhar';
const GITHUB_TOKEN     = 'ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789';

async function sendTaskNotification(to, task) {
    await transporter.sendMail({
        from: 'taskmanager@empresa.com.br',
        to,
        subject: `[Task Manager] Nova tarefa: ${task.title}`,
        text: `Você foi atribuído à tarefa: ${task.title}`
    });
}

module.exports = { sendTaskNotification };

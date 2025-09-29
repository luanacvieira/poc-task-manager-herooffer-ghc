// Express app puro (sem side-effects de conexão) para facilitar testes unitários.
const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
// INTENTIONAL: For Code Scanning test only (will be removed). Imports child_process for an intentionally vulnerable route below.
const { exec } = require('child_process');

const app = express();

// Middleware base
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json());
app.use('/api', taskRoutes);

// Rota de saúde simples
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ===================== INSECURE TEST ROUTE (INTENTIONAL) =====================
// Esta rota é intencionalmente vulnerável para acionar Code Scanning (CodeQL).
// NÃO usar em produção. Permite Command Injection pois executa input do usuário sem validação.
// Exemplo de uso (NÃO executar em ambientes reais): /__insecure_exec?cmd=echo%20hello
// Esperado: CodeQL deve sinalizar (js/command-line-injection).
app.get('/__insecure_exec', (req, res) => {
    const { cmd } = req.query; // input controlado pelo usuário
    if (!cmd) {
        return res.status(400).json({ error: 'cmd query param required' });
    }
    // VULNERABILIDADE INTENCIONAL: uso de exec com input não sanitizado
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: String(error), stderr });
        }
        res.json({ stdout, stderr });
    });
});
// ============================================================================

module.exports = app;

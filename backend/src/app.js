// Express app puro (sem side-effects de conexão) para facilitar testes unitários.
const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
// INTENTIONAL: For Code Scanning test only (will be removed). Imports child_process for an intentionally vulnerable route below.
const { exec } = require('child_process');
const rateLimit = require('express-rate-limit');

const app = express();

// Define a rate limiter specifically for the insecure route (5 requests per minute per IP)
const insecureRouteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware base
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json());
app.use('/api', taskRoutes);

// Rota de saúde simples
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ===================== INSECURE TEST ROUTE (INTENTIONAL) =====================
    // Secure: Only allow a whitelist of safe commands, and use spawn to avoid shell injection
    const allowedCommands = {
        'echo': true,
        'date': true,
        'uptime': true
    };
    // Split cmd into command and args
    const parts = cmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1);
    if (!allowedCommands[command]) {
        return res.status(400).json({ error: 'Command not allowed' });
    }
    const { spawn } = require('child_process');
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    child.on('close', (code) => {
        res.json({ stdout, stderr, code });
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

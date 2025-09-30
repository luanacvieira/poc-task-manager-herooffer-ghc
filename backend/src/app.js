// Express app puro (sem side-effects de conexão) para facilitar testes unitários.
const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware base
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json());
app.use('/api', taskRoutes);

// Rota de saúde simples
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// (Rota insegura de teste removida após validação do Code Scanning)
// CI trigger: comentário adicionado para verificar execução completa dos workflows agora que a base contém o YAML.

module.exports = app;

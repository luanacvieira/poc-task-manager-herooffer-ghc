/**
 * ⚠️  ARQUIVO DE EXEMPLO — WORKSHOP: Tratamento de Dados Sensíveis
 *
 * Este arquivo simula um erro REAL e comum em projetos: commitar
 * credenciais e tokens hardcoded no código-fonte.
 *
 * O GitHub possui o recurso "Secret Scanning + Push Protection" que detecta
 * automaticamente padrões de tokens conhecidos antes do push ser aceito.
 *
 * NÃO FAÇA ISSO EM PRODUÇÃO — Use variáveis de ambiente (.env) ou
 * um cofre de segredos como o Azure Key Vault ou AWS Secrets Manager.
 */

// ❌ ERRADO: Token do GitHub hardcoded (GitHub PAT — formato ghp_)
const GITHUB_TOKEN = 'ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789';

// ❌ ERRADO: Credencial de banco de dados no código
const DATABASE_URL = 'mongodb+srv://admin:SuperSenha@123@cluster0.mongodb.net/taskdb';

// ❌ ERRADO: Chave de API de serviço externo
const SENDGRID_API_KEY = 'SG.aBcDeFgHiJkLmNoPqR.sTuVwXyZ0123456789ABCDEFGabcdefg';

// ❌ ERRADO: AWS Access Key
const AWS_ACCESS_KEY_ID     = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

// ─────────────────────────────────────────────────────────────────────────────
// ✅ CORRETO: Como deveria ser feito — variáveis de ambiente
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Crie um arquivo .env na raiz do projeto (NUNCA commite este arquivo):
//
//    GITHUB_TOKEN=ghp_seuTokenReal
//    DATABASE_URL=mongodb+srv://usuario:senha@cluster/db
//    SENDGRID_API_KEY=SG.chaveReal
//    AWS_ACCESS_KEY_ID=AKIAxxx
//    AWS_SECRET_ACCESS_KEY=segredoReal
//
// 2. Garanta que .env está no .gitignore:
//    echo ".env" >> .gitignore
//
// 3. No código, acesse via process.env:
//
//    const GITHUB_TOKEN         = process.env.GITHUB_TOKEN;
//    const DATABASE_URL         = process.env.DATABASE_URL;
//    const SENDGRID_API_KEY     = process.env.SENDGRID_API_KEY;
//    const AWS_ACCESS_KEY_ID    = process.env.AWS_ACCESS_KEY_ID;
//    const AWS_SECRET_ACCESS_KEY= process.env.AWS_SECRET_ACCESS_KEY;
//
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    githubToken:       process.env.GITHUB_TOKEN,
    databaseUrl:       process.env.DATABASE_URL,
    sendgridApiKey:    process.env.SENDGRID_API_KEY,
    awsAccessKeyId:    process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
};

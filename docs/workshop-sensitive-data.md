# 🔐 Workshop: Tratamento de Dados Sensíveis com GitHub Copilot

## O que foi demonstrado neste exercício

### Fluxo da demonstração

```
1. Criou arquivo config/integrations.js com tokens hardcoded
   ↓
2. git add config/integrations.js
   ↓
3. git commit → [OK localmente, sem hook ainda]
   ↓
4. git push origin demo/sensitive-data-detection
   ↓
5. GitHub Dependabot → reportou 74 vulnerabilidades no repositório
   ↓
6. GitHub Secret Scanning → não bloqueou (Push Protection precisa ser habilitado)
   ↓
7. LIÇÃO: Configurar proteção em múltiplas camadas
```

---

## Camadas de proteção recomendadas

### Camada 1 — Local: Pre-commit Hook
Bloqueia antes mesmo de registrar o commit. Arquivo em `scripts/pre-commit`.

**Como instalar:**
```bash
cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit   # Linux/Mac
```

**Como funciona:**
- Escaneia todos os arquivos no staging area
- Detecta padrões de tokens GitHub, AWS, Stripe, SendGrid, MongoDB
- Detecta nomes de arquivos sensíveis (.env, .pem, id_rsa, credentials.json)
- Bloqueia o commit com mensagem explicativa se encontrar algo

**Exemplo de saída ao bloquear:**
```
❌ BLOQUEADO: Dado sensível detectado em 'config/integrations.js':
   Padrão:  ghp_[A-Za-z0-9]{36}
   Trecho:  ghp_aBcDeFgHiJkLmN...

═══════════════════════════════════════════
  COMMIT BLOQUEADO — Dados sensíveis encontrados!
═══════════════════════════════════════════

💡 O que fazer:
  1. Remova as credenciais do código
  2. Mova para variáveis de ambiente no arquivo .env
  3. Garanta que .env está no .gitignore
  4. Use process.env.NOME_DA_VARIAVEL no código
```

---

### Camada 2 — Repositório: GitHub Push Protection
Bloqueia o `git push` no servidor se detectar tokens conhecidos.

**Como habilitar:**
1. Acesse o repositório no GitHub
2. Vá em **Settings → Security → Code security and analysis**
3. Em **Secret scanning**, habilite **Push protection**

**Exemplo de erro ao fazer push com Push Protection ativo:**
```
remote: error: GH013: Repository rule violations found for refs/heads/demo/...
remote:
remote: - GITHUB PUSH PROTECTION
remote:   —————————————————————————————————————————————————————————————————
remote:    Pushing 1 secret that has not been resolved.
remote:
remote:    Location:  config/integrations.js:17
remote:    Type:      github_personal_access_token
remote:
remote:    To push, remove secret from commit(s) or bypass rule.
remote:    https://docs.github.com/code-security/secret-scanning/...
```

---

### Camada 3 — .gitignore correto
O arquivo `.gitignore` deste projeto já protege:
```
.env
.env.*
!.env.example    ← o .env.example (com valores de exemplo) PODE ser commitado
```

---

### Camada 4 — .env.example como documentação
Use `.env.example` para documentar quais variáveis são necessárias **sem os valores reais**:
```
GITHUB_TOKEN=ghp_seuTokenAqui
DATABASE_URL=mongodb+srv://user:senha@cluster/db
SENDGRID_API_KEY=SG.chaveAqui
```

---

## Como usar variáveis de ambiente no código

### ❌ Errado (hardcoded)
```js
const token = 'ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789';
const db    = 'mongodb+srv://admin:Senha123@cluster.mongodb.net/taskdb';
```

### ✅ Correto (process.env)
```js
// backend/src/app.js
require('dotenv').config(); // npm install dotenv

mongoose.connect(process.env.DATABASE_URL);
```

### ✅ Correto (React / frontend — variáveis prefixadas com REACT_APP_)
```js
// Apenas para variáveis não sensíveis (ficam expostas no bundle!)
const apiUrl = process.env.REACT_APP_API_URL;
```

> ⚠️ **Nunca coloque tokens secretos em variáveis REACT_APP_** — eles ficam visíveis no JavaScript do browser.

---

## Se um segredo já foi commitado — O que fazer?

```bash
# 1. Revogar o token imediatamente na plataforma (GitHub, AWS, etc.)
# 2. Remover do histórico git com BFG Repo Cleaner:
npm install -g bfg
bfg --delete-files integrations.js
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force

# 3. OU usar git filter-repo:
git filter-repo --path config/integrations.js --invert-paths
```

> ⚠️ Mesmo após remover do histórico, considere o token **comprometido** e gere um novo.

---

## Ferramentas recomendadas

| Ferramenta | Tipo | Uso |
|---|---|---|
| [git-secrets](https://github.com/awslabs/git-secrets) | Local | Hook que detecta padrões AWS |
| [detect-secrets](https://github.com/Yelp/detect-secrets) | Local/CI | Baseline de segredos |
| [truffleHog](https://github.com/trufflesecurity/trufflehog) | Local/CI | Varredura profunda no histórico |
| GitHub Secret Scanning | Servidor | Detecção em PRs e pushes |
| GitHub Dependabot | Servidor | Vulnerabilidades em dependências |
| Azure Key Vault | Cloud | Cofre de segredos em produção |
| AWS Secrets Manager | Cloud | Cofre de segredos em produção |

---

## Arquivos deste exercício

| Arquivo | Propósito |
|---|---|
| `config/integrations.js` | ❌ Exemplo do que NÃO fazer |
| `.env.example` | ✅ Template de variáveis (sem valores reais) |
| `scripts/pre-commit` | ✅ Hook local de detecção |
| `.gitignore` (linhas 74-76) | ✅ Proteção de arquivos .env |

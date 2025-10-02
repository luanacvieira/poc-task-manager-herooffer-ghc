# poc-task-manager-herooffer-ghc

<!-- BADGES-AUTO-START -->
![Build (master)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/build-status-badge-master.json)
![Coverage (master)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/coverage-badge-master.json)
![Coverage Gate (master)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/coverage-gate-badge-master.json)
![Sonar Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=alert_status)
![Sonar Coverage](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=coverage)
![Sonar Bugs](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=bugs)
![Sonar Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=vulnerabilities)
![Sonar Code Smells](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=code_smells)
![Sonar Maintainability](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=sqale_rating)
![Sonar Reliability](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=reliability_rating)
![Sonar Security](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=security_rating)
<!-- BADGES-AUTO-END -->

## Status & Qualidade

| Métrica | Valor (último run CI/CD) |
|---------|--------------------------|
| Cobertura (Combined) | Ver badge acima + summary do workflow |
| Histórico Cobertura | [coverage-history-master.json](https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/history/coverage-history-master.json) |

Os badges são publicados na branch `badges` em `badges/*.json` e `badges/history/*.json`. Cada branch gera seus próprios arquivos sanitizados (`coverage-badge-<safeBranch>.json`).

## Estratégia de Testes

Camadas adotadas para máxima cobertura e manutenção simples:

1. Testes Isolados ("isolated")
	- Simulam comportamento de Model e Controller sem Mongoose real.
	- Objetivo: validar regras de negócio e fluxos de erro rapidamente.

2. Testes Actual Controller ("actual")
	- Invocam o código real do controller, mockando apenas o Model (métodos `find`, `save`, etc.).
	- Garante cobertura de logs, branches de erro, respostas HTTP e tratamento de not found.

3. Testes de Rotas
	- Verificam o mapeamento Express (`GET /tasks`, `POST /tasks`, etc.) usando `supertest` e mocks dos controllers.
	- Garante que mudanças de nomes ou paths sejam detectadas.

4. Testes de Integração (opcional / ativados sob demanda)
	- Utilizam `mongodb-memory-server` com Mongoose 7 para CRUD real.
	- Focados em validação de pipeline (criar, listar, atualizar, deletar) sem side effects permanentes.

5. Frontend
	- React Testing Library + `user-event` para interações reais (digitação, clique, seleção).
	- TaskForm: validação de formulário, transformação de tags, reset de estado, erros.
	- Home: carregamento, estados de erro, toggle de conclusão, deleção, renderização de meta dados e tags.

### Decisões de Arquitetura
* `src/app.js` exporta somente o Express app (sem conectar BD) para facilitar testes.
* `src/server.js` isola efeitos colaterais (conexão Mongo + `listen`).
* Testes de integração têm config separada (`jest.config.integration.js`).
* Cobertura 100% em models, controllers e rotas via camada unit/actual.

### Executando
```
npm run test:unit              # backend unit (isolated + actual + rotas)
npm run test:integration       # backend integração (mongodb-memory-server)
```

Front-end (dentro da pasta frontend):
```
npm test -- --watchAll=false
```

### Boas Práticas Implementadas
* Separação clara entre app e server para evitar conexão em `require`.
* Remoção de opções Mongoose deprecated (useUnifiedTopology etc.).
* Uso de serviços (`services/api.ts`) para desacoplar componentes de chamadas axios diretas.
* Botão de submit com estado de carregamento e `disabled` evitando duplo envio.
* Cobertura de erros em todas as operações críticas.

## Branch Protection (Cobertura >= 80%)
1. Settings → Branches → Branch protection rules → Edit (ou Add rule para `main`).
2. Marque:
	* Require a pull request before merging (recomendado)
	* Require status checks to pass before merging
	* Require branches to be up to date before merging
3. Em "Status checks that are required" selecione: 
	* Build & Test (Backend + Frontend) (workflow CI/CD)
	* Gate (Coverage + CodeQL) (do workflow CodeQL) — se quiser usar o gate unificado de segurança
4. Salve. Um PR só poderá ser mergeado se ambos estiverem verdes.

## Pre-push Hook Local (opcional)
Crie `.githooks/pre-push` com:
```
#!/usr/bin/env bash
echo "[pre-push] Running quick coverage gate...";
set -e;
pushd backend >/dev/null
npm test -- --coverage --coverageDirectory=coverage-unit --coverageReporters=json-summary --watchAll=false --runInBand >/dev/null
node -e "const fs=require('fs');const t=80;const s=JSON.parse(fs.readFileSync('coverage-unit/coverage-summary.json')).total;const m=['lines','branches','functions','statements'];const bad=m.filter(k=>s[k].pct<t);if(bad.length){console.error('Backend coverage < '+t+'%: '+bad.join(','));process.exit(1);}"
popd >/dev/null
echo "[pre-push] OK"
```
Ative:
```
git config core.hooksPath .githooks
chmod +x .githooks/pre-push
```

## Badge de Cobertura (Automatizado)
Arquivos publicados (branch `badges`):
- `badges/coverage-badge.json` (última média combinada geral)
- `badges/coverage-badge-master.json` (específico master)
- `badges/coverage-gate-badge*.json` (pass/fail do gate)
- `badges/history/coverage-history*.json` (históricos global e por branch)

Formato (`coverage-badge.json`):
```json
{ "schemaVersion": 1, "label": "coverage", "message": "88.42%", "color": "green" }
```
Cor dinâmica: >=90 brightgreen, >=80 green, senão orange.

### Como validar após merge
1. Merge ou commit em `master`.
2. Aguardar: Static Checks → Test and Coverage Check → Sonar → Build.
3. Abrir branch `badges` → arquivo `badges/coverage-badge-master.json`.
4. (Opcional) Ver histórico: `badges/history/coverage-history-master.json`.
5. Se Shields demorar a atualizar, acrescentar `&cacheSeconds=60`.

### Exemplos de URLs (master)
Coverage: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/coverage-badge-master.json`
Gate: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/coverage-gate-badge-master.json`
Build: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/build-status-badge-master.json`

### Problemas comuns
- Badge não atualiza: workflow não terminou ou cache Shields.
- Gate fail: alguma métrica <80% (ver artifact combined-coverage-summary.json).
- 404: branch `badges` ainda não tem aquele arquivo (workflow não rodou para essa branch).


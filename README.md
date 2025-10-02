# poc-task-manager-herooffer-ghc

## Status & Qualidade

![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/gh-pages/badges/coverage-badge.json)
![Coverage (develop)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/gh-pages/badges/coverage-badge-develop.json)
![Coverage (master)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/gh-pages/badges/coverage-badge-master.json)

| Métrica | Valor (último run CI/CD) |
|---------|--------------------------|
| Cobertura (Combined) | Exibida acima (badge) + summary do workflow |

O badge é gerado automaticamente pelo workflow "Test and Coverage Check" (job `coverage-gate`) e publicado na branch `gh-pages` em `badges/coverage-badge.json`. Também são publicados arquivos específicos por branch: `coverage-badge-develop.json` e `coverage-badge-master.json`.

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
Pipeline já implementada.

Arquivos publicados (branch `gh-pages`):
- `badges/coverage-badge.json` (última média combinada)
- `badges/coverage-badge-develop.json`
- `badges/coverage-badge-master.json`

Formato (`coverage-badge.json`):
```json
{ "schemaVersion": 1, "label": "coverage", "message": "88.42%", "color": "green" }
```
O valor real e a cor são definidos dinamicamente conforme thresholds (>=90 brightgreen, >=80 green, senão orange).

### Como validar após merge
1. Fazer merge/commit em `develop` ou `master`.
2. Aguardar execução: Static Checks → Test and Coverage Check → Build.
3. Verificar em *Actions* que `coverage-gate` terminou com sucesso.
4. Trocar para a branch `gh-pages` no GitHub (Code > switch branch) e abrir `badges/coverage-badge.json` (deve conter campos `schemaVersion`, `label`, `message`, `color`).
5. Conferir o badge no README atualizando a página (pode haver cache de até ~5 min no Shields; acrescentar query `?cacheSeconds=60` se necessário).

### Exemplos de URLs
Badge principal: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/gh-pages/badges/coverage-badge.json`

Badge develop: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/gh-pages/badges/coverage-badge-develop.json`

Badge master: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/gh-pages/badges/coverage-badge-master.json`

### Problemas comuns
- Badge não atualiza: confirmar se branch protegida rodou workflow e se commit alterou cobertura (senão sem push em gh-pages).
- Cor inesperada: verificar média (arquivo `coverage-badge.json`) e thresholds.
- 404 no raw: primeiro merge ainda não rodou/gerou branch `gh-pages`.


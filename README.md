# poc-task-manager-herooffer-ghc

## Status & Qualidade

| Métrica | Valor (último run CI/CD) |
|---------|--------------------------|
| Cobertura (Combined) | (gerada em runtime no summary do workflow) |

Para exibir um badge dinâmico futuramente, podemos publicar `combined-coverage/combined-coverage-summary.json` em uma branch `gh-pages` ou usar GitHub Shields com endpoint JSON. (Ver seção "Badge de Cobertura" abaixo.)

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

## Badge de Cobertura (Plano Futuro)
1. Adicionar passo no workflow para extrair porcentagem combined e gerar `coverage-badge.json`.
2. Publicar via GitHub Pages ou Action `peaceiris/actions-gh-pages` em pasta com JSON.
3. Usar Shields: `https://img.shields.io/endpoint?url=<raw-json-url>`.

Estrutura do JSON esperada pelo Shields:
```
{ "schemaVersion": 1, "label": "coverage", "message": "85%", "color": "yellowgreen" }
```


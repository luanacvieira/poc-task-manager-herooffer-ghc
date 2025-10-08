# poc-task-manager-herooffer-ghc

<!-- BADGES-AUTO-START -->
![Build (master)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/build-status-badge-master.json)
![Coverage (master)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/coverage-badge-master.json)
![Coverage Gate (master)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/coverage-gate-badge-master.json)
![Risk Score (master)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/risk-score-badge-master.json)
<!-- pipeline trigger no-op: ajuste cosmético -->
![Sonar Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=alert_status)
![Sonar Coverage](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=coverage)
![Sonar Bugs](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=bugs)
![Sonar Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=vulnerabilities)
![Sonar Code Smells](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=code_smells)
![Sonar Maintainability](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=sqale_rating)
![Sonar Reliability](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=reliability_rating)
![Sonar Security](https://sonarcloud.io/api/project_badges/measure?project=github_poc-task-manager-herooffer-ghc&metric=security_rating)
![Coverage (feature/betterrole-with-tests1)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/coverage-badge-feature-betterrole-with-tests1.json)
![Coverage Gate (feature/betterrole-with-tests1)](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/coverage-gate-badge-feature-betterrole-with-tests1.json)
<!-- BADGES-AUTO-END -->

## Status & Qualidade

| Métrica | Valor (último run CI/CD) |
|---------|--------------------------|
| Cobertura (Combined) | Ver badge acima + summary do workflow |
| Histórico Cobertura | [coverage-history-master.json](https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/history/coverage-history-master.json) |
| Visual (Gráfico) | `docs/coverage-history.html` (GitHub Pages após merge em master) |

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

Os badges são gerados automaticamente pelo workflow **"Test and Coverage Check"** (job `coverage-gate`) e publicados na branch `badges` dedicada. O sistema suporta múltiplas branches com arquivos específicos sanitizados.

**Arquivos publicados (branch `badges`):**
- `badges/coverage-badge.json` (cobertura geral - última branch)
- `badges/coverage-badge-<safeBranch>.json` (específico por branch)
- `badges/coverage-gate-badge-<safeBranch>.json` (pass/fail do gate ≥80%)
- `badges/build-status-badge-<safeBranch>.json` (status do build)
- `badges/history/coverage-history.json` (histórico global - últimas 500 entradas)
- `badges/history/coverage-history-<safeBranch>.json` (histórico por branch - últimas 200)
- `badges/history/coverage-latest-<safeBranch>.json` (snapshot mais recente)

Formato (`coverage-badge.json`):
```json
{ "schemaVersion": 1, "label": "coverage", "message": "88.42%", "color": "green" }
```
Cor dinâmica: >=90 brightgreen, >=80 green, senão orange.

### Como validar após commit/push
1. **Push em qualquer branch** (master, develop, feature/*)
2. **Aguardar sequência completa:**
   - ✅ Static Checks (CodeQL, lint)
   - ✅ Test and Coverage Check (testes + coverage gate + badges)
   - ✅ Build (build + build badge)  
   - ✅ SonarCloud Analysis (qualidade + métricas)
3. **Verificar branch `badges`** → arquivos gerados:
   - `badges/coverage-badge-<safeBranch>.json`
   - `badges/coverage-gate-badge-<safeBranch>.json`
4. **README atualizado automaticamente** com badges específicos da branch
5. **Histórico disponível:** `badges/history/coverage-history-<safeBranch>.json`
6. **Se badges demoram:** adicionar `&cacheSeconds=60` na URL do Shields

### Exemplos de URLs (master)
Coverage: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/coverage-badge-master.json`
Gate: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/coverage-gate-badge-master.json`
Build: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/luanacvieira/poc-task-manager-herooffer-ghc/badges/badges/build-status-badge-master.json`

### Problemas comuns e soluções
- **Badge "resource not found":** Workflow ainda não rodou para essa branch ou falhou na etapa de coverage
- **Badge não atualiza:** Cache do Shields.io (aguarde ou adicione `&cacheSeconds=60`)
- **Coverage Gate FAIL:** Alguma métrica <80% (lines/statements/functions/branches) - verificar logs do workflow
- **README não atualizado:** Workflow falhou no step de atualização ou conflitos de git  
- **Arquivos missing na branch `badges`:** Workflow "Test and Coverage Check" não completou com sucesso
- **SonarCloud sem coverage:** Artifacts não chegaram ou expiraram (agora tem fallback gracioso)

## Modelos de Pipeline (Comparativo para Apresentação ao Cliente)

### Diagrama (Orchestrator)

```mermaid
flowchart TD
	Lint[lint] --> Typecheck[typecheck]
	Typecheck --> TB[test-backend]
	Typecheck --> TF[test-frontend]
	TB --> Cov[coverage-gate]
	TF --> Cov
	Cov --> BBack[build-backend]
	BBack --> BFront[build-frontend]
	BFront --> CodeQL[codeql]
	BFront --> Sonar{sonar (push only)}
	CodeQL --> Final[finalize]
	Sonar --> Final
```

Este repositório contém DOIS MODELOS operacionais de CI para demonstrar vantagens / trade-offs:

### 1. Modelo "Separado" (Workflows Independentes)
Workflows distintos encadeados anteriormente por `workflow_run` (agora disparando diretamente por push/PR):

| Workflow | Arquivo | Foco | Responsabilidades principais |
|----------|---------|------|------------------------------|
| Static Checks | `.github/workflows/static-checks.yml` | Qualidade rápida | Lint (backend+frontend), TypeScript check |
| Test and Coverage Check | `.github/workflows/tests-and-coverage.yml` | Qualidade + Métricas | Testes backend/frontend, merge coverage, gate ≥80%, geração de badges, atualização README |
| Build | `.github/workflows/ci-cd.yml` | Build artefatos | Smoke backend, build frontend, badge de build |
| CodeQL | `.github/workflows/codeql.yml` | SAST | Análise segurança (JavaScript) + gate |
| Semgrep | `.github/workflows/semgrep.yml` | SAST adicional | Semgrep OWASP/JS + SARIF + gate ERROR |
| SonarCloud (isolado) | `.github/workflows/sonar-analysis.yml` | Qualidade contínua (push) | Análise Sonar (fallback se separado) |

Vantagens:
* Clara separação de responsabilidades.
* Execuções paralelas possíveis entre workflows (menor tempo wall-clock quando escalado).
* Fácil desativar/pausar partes específicas (ex: Sonar ou Semgrep isoladamente).

Desvantagens:
* Overhead de múltiplos agendamentos e filas em repositórios grandes.
* Maior complexidade para auditar cadeia completa em um único lugar.
* Risco (antes mitigado) de uso incorreto de `workflow_run` com código de PR.

### 2. Modelo "Orquestrado" (Único Workflow Encadeado)
Workflow unificado: `.github/workflows/orchestrator.yml`.

Pipeline (ordem via `needs`):
```
lint → typecheck → (test-backend & test-frontend) → coverage-gate → build-backend → build-frontend → (codeql, sonar*) → finalize
													   ^                                   ^            ^        ^
													   |                                   |            |        +-- resumo final
													   |                                   |            +----------- SAST (CodeQL)
													   |                                   +----------------------- Build final
													   +----------------------------------- Garante qualidade antes de build
```
(* Sonar só em push para evitar uso de token em PR de fork.)

Vantagens:
* Cadeia única visível – facilita revisão executiva e auditoria.
* Elimina dependência de `workflow_run` mitigando risco de execução de código não confiável com segredos.
* Sequenciamento determinístico: falhas “early” param o resto rapidamente.
* Simplifica lista de Required Status Checks (pode exigir só alguns jobs-chave do orquestrador).

Desvantagens:
* Menos paralelismo entre grandes grupos (tudo dentro de um arquivo).
* Alterações pequenas exigem abrir o arquivo mais extenso.
* Pode ficar mais “verboso” ao longo do tempo se não modularizado (reusable actions / composite).

### Quando mostrar cada modelo ao cliente
| Cenário | Recomendação |
|---------|--------------|
| Organização quer visibilidade granular e desligar etapas rapidamente | Modelo Separado |
| Equipe menor / facilidade de governança / auditoria compliance | Orquestrado |
| Preocupação forte com supply-chain / PRs de fork | Orquestrado (menos vetores) |
| Otimização de tempo total usando runners paralelos | Separado |

### Estratégia Híbrida (Opcional)
Manter ambos por um período de transição:
1. Marcar workflows separados como "LEGACY" no campo `name:` quando o cliente aprovar o orquestrado.
2. Ajustar Branch Protection para exigir apenas os jobs do orquestrador.
3. Desativar (ou renomear com prefixo `_disabled_`) os antigos após 2–4 semanas sem incidentes.

### Próximos aprimoramentos possíveis
* Converter blocos repetidos (install deps, setup node) em Action composite interna.
* Adicionar publicação de SBOM (Syft) e scan (Grype) antes do build.
* Introduzir cache inteligente de cobertura incremental (ex.: diff-cover) para feedback mais rápido em PRs.
* Gerar dashboard HTML agregando Semgrep + CodeQL + Coverage + Sonar (artefato).

Se desejar posso marcar visualmente os workflows antigos como LEGACY e/ou adicionar badges específicos do orquestrador – é só pedir.


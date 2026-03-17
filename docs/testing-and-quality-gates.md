# Testes, Cobertura e Quality Gates

## 1) Visão geral

Este documento descreve:

- Como executar todos os testes (backend e frontend) com comandos relativos ao diretório do repositório.
- Onde os artefatos de cobertura são gerados.
- Onde o gate de cobertura de **80%** está referenciado.
- Diferenças atuais entre o que está documentado e o que está efetivamente aplicado no script combinado.

## 2) Execução local

### Backend - Unit

```powershell
# a partir da raiz do repositório
Set-Location .\backend
npm run test:unit
```

Saída de cobertura:

- `backend\coverage-unit\coverage-summary.json`
- `backend\coverage-unit\lcov.info`

### Backend - Integration

```powershell
# a partir da raiz do repositório
Set-Location .\backend
npm run test:integration
```

Saída de cobertura:

- `backend\coverage-integration\`

### Frontend

```powershell
# a partir da raiz do repositório
Set-Location .\frontend
npm test
```

Saída de cobertura:

- `frontend\coverage\coverage-summary.json`
- `frontend\coverage\lcov.info`

### Cobertura combinada (backend unit + frontend)

```powershell
Set-Location "C:\Projetos\Patria\poc-task-manager\poc-task-manager"
node "C:\Projetos\Patria\poc-task-manager\poc-task-manager\.github\scripts\combine-coverage.js" "C:\Projetos\Patria\poc-task-manager\poc-task-manager\backend\coverage-unit\coverage-summary.json" "C:\Projetos\Patria\poc-task-manager\poc-task-manager\frontend\coverage\coverage-summary.json"
```

Saída:

- `C:\Projetos\Patria\poc-task-manager\poc-task-manager\combined-coverage\coverage-metrics.json`

## 3) Onde o gate de 80% está referenciado

### A) Threshold por projeto (Jest)

- Backend unit: `backend/jest.config.unit.js`
  - `branches: 80`
  - `functions: 80`
  - `lines: 80`
  - `statements: 80`

- Frontend: `frontend/jest.config.js`
  - `branches: 80`
  - `functions: 80`
  - `lines: 80`
  - `statements: 80`

### B) Diff coverage no CI

- `/.github/workflows/testing.yml`
  - variável `DIFF_THRESHOLD: 80`

- `/.github/scripts/diff-coverage.sh`
  - fallback `THRESHOLD=${DIFF_THRESHOLD:-80}`

### C) Referências de documentação/operação

- `README.md`
  - seção **Branch Protection (Cobertura >= 80%)**
  - orientações de gate e badges com `>=80%`

### D) Script alternativo com 80% (não chamado no workflow principal)

- `/.github/scripts/enhanced-coverage-gate.sh`
  - define `THRESHOLD=80`
  - exige 80% para backend, frontend e combinado

## 4) Divergência atual importante

No workflow principal, o cálculo combinado usa:

- `/.github/scripts/combine-coverage.js`
  - `thresholds={ lines:70, statements:70, functions:70, branches:70 }`

Ou seja, há coexistência de regras de 80% (Jest/diff/doc) com gate combinado em 70% nesse script específico.

## 5) Recomendação de alinhamento

Para manter consistência de governança, escolher um padrão único (recomendado: 80%) e alinhar:

1. `/.github/scripts/combine-coverage.js` (70 -> 80, se esta for a política oficial).
2. `README.md` e docs, mantendo a mesma regra aplicada no CI.
3. Branch protection checks no GitHub, exigindo os jobs correspondentes ao gate final.

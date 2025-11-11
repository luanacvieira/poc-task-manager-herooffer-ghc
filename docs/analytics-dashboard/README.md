# Dashboard Analítico (Cobertura, Segurança, Performance)

Este diretório contém a versão HTML estática gerada pelo workflow `analytics-dashboard.yml` consolidando:

- Histórico de cobertura consolidada (branch `badges`).
- Distribuição de severidade de alertas Code Scanning (CodeQL + Semgrep).
- Métricas de performance do pipeline (duração média e p95 de runs recentes).
- Índice Composto de Risco (heurística simples combinando severidade e cobertura).

Para regenerar manualmente: acione o workflow "Analytics Dashboard" via *workflow_dispatch*.

Se GitHub Pages estiver habilitado apontando para `docs/`, a página estará disponível publicamente em:

`https://<org-ou-usuario>.github.io/<repo>/analytics-dashboard/`

> Ajuste e refine a heurística do índice de risco em `scripts/generate-analytics-dashboard.js` conforme políticas internas.

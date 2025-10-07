# POC GitHub Platform – Visão Executiva Unificada

> **Objetivo**: Demonstrar maturidade de Engenharia (Qualidade, Segurança, Governança e Produtividade) em um único painel narrativo para decisão e patrocínio. Conteúdo pensado para caber em **1 SLIDE** (ou virar primeira lâmina de um deck). Use como base para apresentação ao cliente.

---
## 🔭 Mensagem Central
Pipeline orquestrado único ("Orchestrator") consolida validações de código, segurança e evidências de qualidade – tudo versionado, auditável e com métricas históricas (badges & dashboard). Reduz atrito, aumenta confiança em releases contínuos e acelera time‑to‑value.

---
## 🧩 Componentes (Workflows & Arquivos)
| Pilar | Automação / Artefato | Resultado Tangível | Benefício Negócio |
|-------|----------------------|--------------------|-------------------|
| Qualidade | Lint + Typecheck + Testes + Coverage Gate + Diff Coverage (Orchestrator) | Média de cobertura, gate ≥80%, diffs protegidos | Redução regressões & custo de manutenção |
| Segurança | CodeQL, Semgrep, SonarCloud, SBOM | Alertas precoces, análise estrutural, inventário dependências | Mitiga riscos de vulnerabilidades e compliance |
| Produtividade | Build backend/frontend + Imagem GHCR + Auto‑merge Dependabot | Artefatos prontos + atualizações seguras rápidas | Liberação mais rápida e menos esforço manual |
| Governança | Badges versionados, Histórico JSON, Dashboard analítico, CODEOWNERS, PR Template | Transparência contínua + rastreabilidade + processos padronizados | Confiança e auditoria simplificada |
| Supply Chain | SBOM combinado + Dependabot agrupado | Visibilidade de componentes & atualizações focadas | Acelera resposta a CVEs |
| Observabilidade Métricas | Dashboard (cobertura, aging, diffs, performance) | Insights acionáveis para evolução | Decisões guiadas por dados |
| DX (Developer Experience) | Orchestrator único + comentários automáticos em PR | Menor fricção, onboarding rápido | Aumento de throughput do time |

---
## ⚙️ Gatilhos & Fluxo (Simplificado)
```
Push / PR ➜ Orchestrator
  1. Lint / Typecheck
  2. Testes (Back + Front)
  3. Coverage Gate & Diff Coverage
  4. Build (Back / Front) + Image (GHCR)
  5. Segurança: CodeQL + Semgrep + Sonar
  6. SBOM Merge
  7. Badges + Históricos + PR Delta
  8. (Optional) Deploy Demo QA / PRD
Schedule ➜ Semgrep semanal | Dashboard diário | CodeQL semanal
Dependabot Schedules ➜ PRs agrupadas (backend, frontend, actions)
```

---
## 📊 Evidências Visíveis (Onde Ver)
| Evidência | Local | Exemplo Valor |
|-----------|-------|---------------|
| Badges (coverage/gate/diff/build) | Branch `badges` + README | Saúde instantânea do código |
| Histórico Cobertura / Diff | `badges/history/*.json` | Tendência de qualidade |
| Dashboard Analytics | `badges/docs/analytics-dashboard/` | Visão 360 (qualidade + aging) |
| Alertas Segurança | Security > Code scanning / SonarCloud | Ação preventiva |
| SBOM | Artifact `sbom/combined.json` | Inventário dependências |
| Comentário PR (delta) | PR (`<!-- coverage-delta -->`) | Impacto imediato da mudança |

---
## 🏅 Diferenciais (Why This POC Matters)
1. **Integração Unificada**: Menos contexto perdido entre múltiplos workflows.
2. **Diff Coverage & Delta PR**: Incentiva escrever testes junto do código novo – métrica orientada a comportamento.
3. **Publicação Imutável de Métricas**: Histórico versionado – suporte a auditoria e SLA de qualidade.
4. **SBOM + Dependabot Agrupado**: Base para práticas de Supply Chain e resposta rápida a CVEs.
5. **Escalabilidade**: Fácil acoplar gates adicionais (mutation testing, license scan, secret scan) sem reescrever pipeline.

---
## 🚀 Roadmap Proposto (Próximos 30–60 dias)
| Fase | Incremento | Valor Adicionado |
|------|------------|------------------|
| 1 | Secret & License Scanning | Mitiga risco de vazamento / licenças incompatíveis |
| 1 | Badge de Health Consolidado (score) | Comunicação executiva única |
| 2 | Gating de Qualidade Dinâmico (baseline adaptativo) | Reduz endurecimento artificial de metas |
| 2 | Release Automático (semver + CHANGELOG) | Previsibilidade em entregas |
| 3 | Mutation Testing (amostragem) | Eleva rigor real de testes |
| 3 | Publish Dashboard em GitHub Pages (visual) | Acesso simplificado para stakeholders |

---
## 📐 Métrica Âncora (Exemplo de Leitura)
> "Coverage média 84% (+2,3pp vs master), diff coverage 100% (mudança bem testada), nenhum novo alerta crítico CodeQL, aging médio de alertas de segurança ≤ 2 dias".

Interpretação rápida para decisão: **OK para promover a PR / liberar release**.

---
## 🧠 Mensagem Final
> Esta POC prova capacidade de elevar padrões de Engenharia (Qualidade + Segurança + Governança) com evidências contínuas e baixo atrito operacional – pronta para escala.

---
### � Fórmula Heurística Atual do Risk Score
### 🔒 Fórmula Heurística Atual do Risk Score
Base 100 – penalidades:
 Coverage gate fail: -30
 Cobertura média <85: -10 | 85–<90: -5
 Diff coverage <80: -15 | 80–<90: -5
 CodeQL não success: -15
 Semgrep não success: -10
 Sonar não success: -10
 Severidades (crit:-12, high:-8, medium:-4) somadas (máx 40)
 Aging médio alertas (dias): >14:-10  >7:-6  >3:-3
 Resultado final clamp 0–100 → badge risk score.
 Futuro: incluir secrets/leaks, licenças, dependências críticas com CVE alta.

---
###  Notas para Conversão em Slide
Use **fundo escuro (charcoal #14171c)**, accent primário **verde (qualidade)** e secundário **ciano (segurança)**. Transforme cada bloco (Componentes, Evidências, Diferenciais, Roadmap) em caixas compactas (máx. 4–5 bullets). Título grande e mensagem final em destaque (callout) na base.

---
### 🧪 Status de Maturidade do Risk Score
| Aspecto | Implementado | Detalhe |
|---------|--------------|---------|
| Badge (valor + cor) | Sim | `risk-score-badge.json` + por branch |
| Histórico (trend) | Sim | `risk-score-history-<branch>.json` |
| Breakdown componentes | Sim | `risk-score-latest-<branch>.json` |
| Severidades (Code Scanning + Semgrep) | Parcial | Merge básico via API + SARIF (pode refinar) |
| Aging de alertas | Parcial | Média baseada em firstSeen catalogado (início coleta) |
| Sonar issues severities | Não | Próximo passo (API Sonar) |
| Dependências com CVE | Não | Exige integração futura (OSV / GH Advisory) |
| Secrets & Licenses | Não | Aguardando habilitação scanners |

### 🛠 O que está "Stub" / Parcial
- Aging inicial ainda sem retroatividade (começa a contar agora).
- Penalidades de severidade limitadas àquilo que GitHub Code Scanning + Semgrep expõem diretamente.
- Sem enriquecimento de contexto (ex: path crítico vs. teste, peso diferenciado).
- Não considera (ainda) vulnerabilidades em dependências (SBOM + advisories).

### 🧭 Roadmap para ficar "Executivo" de Verdade
| Ordem | Item | Resultado de Negócio |
|-------|------|----------------------|
| 1 | Integrar contagem de issues Sonar (severity) | Score reflete debt/vulns percebidas staticamente |
| 2 | Persistir aging granular por alerta (retroativo) | Tendência de resposta a risco confiável |
| 3 | Mapear SBOM -> CVEs críticos (OSV / Advisory API) | Visão unificada risco de dependências |
| 4 | Secret / License Scanning no score | Cobertura de risco operacional e compliance |
| 5 | Peso dinâmico baseado em criticidade (ex: diretórios core) | Priorização contextual |
| 6 | Badge Health (score composto) | Comunicação executiva instantânea |

### ✅ Próximos Passos Recomendados (Enxutos)
1. Adicionar API Sonar (issues severities) ao cálculo.
2. Normalizar aging (guardar histórico incremental completo) e exibir gráfico no dashboard.
3. Incluir decomposição no dashboard (sparkline + tabela).
4. Integrar CVE lookup (mínimo: crit/high) usando OSV API.
5. Criar badge agregado "engineering health" (Risk Score + Coverage Gate + Trend).

---
Use **fundo escuro (charcoal #14171c)**, accent primário **verde (qualidade)** e secundário **ciano (segurança)**. Transforme cada bloco (Componentes, Evidências, Diferenciais, Roadmap) em caixas compactas (máx. 4–5 bullets). Título grande e mensagem final em destaque (callout) na base.

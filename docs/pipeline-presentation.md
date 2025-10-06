# CI/CD Pipeline – Opções Apresentadas

## Objetivo
Demonstrar duas abordagens de orquestração de qualidade, segurança e build para o projeto:
1. Workflows Separados (LEGACY) – modularidade e paralelismo.
2. Orchestrator Único – rastreabilidade e governança simplificada.

---
## Visão Geral (Modelo Separado)
- Static Checks (Lint + Typecheck)
- Test and Coverage (Testes + Gate + Badges)
- Build (Backend + Frontend + Build Badge)
- CodeQL (SAST, segurança estrutural)
- Semgrep (SAST padrão + OWASP)
- SonarCloud (Qualidade / Tech Debt / Vulnerabilidades)

Vantagens:
- Escalável em repositórios grandes.
- Permite pausar partes sem afetar o restante.
- Execuções paralelas naturais.

Desvantagens:
- Cadeia total mais difícil de auditar.
- Maior risco de configuração incorreta com `workflow_run`.
- Mais arquivos para manter.

---
## Visão Geral (Modelo Orchestrator)
Arquivo: `.github/workflows/orchestrator.yml`

Pipeline:
```
lint → typecheck → (test-backend & test-frontend) → coverage-gate → build-backend → build-frontend → (codeql, sonar*) → finalize
```
(*) Sonar apenas em push – evita uso de token em PR de fork.

Benefícios:
- Cadeia linear transparente.
- Falhas param cedo (fail fast).
- Lista de Required Checks mais simples.
- Sem dependência de `workflow_run`.

---
## Diagrama Mermaid
```mermaid
flowchart TD
  Lint --> Typecheck
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

---
## Segurança & Qualidade
| Camada | Ferramenta | Propósito |
|--------|------------|-----------|
| Lint / TS | ESLint / tsc | Qualidade estática inicial |
| Cobertura | Jest (backend/frontend) | Gate ≥80% + histórico + delta/trend |
| SAST 1 | CodeQL | Vulnerabilidades estruturais / dataflow |
| SAST 2 | Semgrep | Regras OWASP / padrões inseguros |
| Qualidade Global | SonarCloud | Hotspots, smells, coverage, ratings |

---
## Geração de Badges
- Branch `badges` (JSON endpoints)
- Coverage, Coverage Gate, Build, Delta, Trend, Histórico
- Atualização automática do README (bloco delimitado)

---
## Trade-offs Resumidos
| Critério | Separado | Orchestrator |
|----------|----------|--------------|
| Visibilidade cadeia | Média | Alta |
| Paralelismo global | Alto | Médio |
| Simplicidade manutenção | Menor | Maior |
| Risco configuração `workflow_run` | Maior (antes) | Eliminado |
| Onboarding novos devs | Mais passos | Único arquivo |

---
## Estratégia de Transição Recomendada
1. Executar ambos em paralelo (fase de validação).
2. Monitorar tempo médio e taxa de falhas.
3. Apontar Required Checks para jobs do Orchestrator.
4. Marcar workflows antigos como LEGACY (já feito).
5. Remover gradualmente após 2–4 semanas.

---
## Próximos Incrementos (Roadmap)
- Composite actions para instalação repetitiva.
- SBOM (Syft) + análise (Grype).
- Relatório unificado (HTML) de segurança + cobertura.
- Diff Coverage (otimização de feedback em PRs grandes).
- Gate adicional: Semgrep WARNING ratio > X% opcional.

---
## Perguntas Frequentes
**Por que manter os dois modelos temporariamente?**
Mitiga risco de regressão e fornece base comparativa de performance.

**Onde ficam os históricos?**
`badges/history/*.json` na branch `badges`.

**Como desligar o modelo antigo?**
Renomear arquivos ou arquivar (prefixo `_disabled_`) e remover Required Checks antigos.

---
## Encerramento
Ambas abordagens atendem requisitos de qualidade e segurança; escolha final depende de governança, escala e preferência operacional.

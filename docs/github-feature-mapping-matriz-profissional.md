## Matriz Profissional de Capacidades GitHub Enterprise – POC Task Manager

Data de Referência: 2025-10-06  
Objetivo: Demonstrar, em linguagem executiva e tecnicamente precisa, o alinhamento entre o catálogo de funcionalidades GitHub Enterprise e o que está efetivamente implementado / parcialmente implementado / planejado nesta POC.

Legenda de Status:  
✅ Implementado | 🟡 Parcial / Em Evolução | 🔴 Não Implementado (Oportunidade)  

Estrutura das colunas principais:
| Coluna | Significado |
|--------|-------------|
| Pilar / Categoria | Agrupamento estratégico (Segurança, CI/CD, etc.). |
| Funcionalidade (Catálogo) | Nome base do catálogo fornecido. |
| Denominação Profissional Aplicada | Forma executiva utilizada na narrativa corporativa. |
| Status | Situação atual na POC. |
| Implementação Técnica (Arquivo / Job / Local) | Onde isso está codificado / configurado. |
| Momento de Execução (Trigger / Condição) | Quando roda ou é avaliado. |
| Evidência / Onde Visualizar | Local no GitHub UI / Artefato / Branch. |
| Valor Entregue / Objetivo | Benefício mensurável ou propósito. |
| Próximo Incremento Recomendado | Evolução sugerida de maior impacto. |

---

### 🛡️ Pilar: Segurança & Software Supply Chain

| Categoria (Catálogo) | Funcionalidade (Catálogo) | Denominação Profissional Aplicada | Status | Implementação Técnica (Arquivo / Job / Local) | Momento de Execução | Evidência / Onde Visualizar | Valor Entregue / Objetivo | Próximo Incremento Recomendado |
|----------------------|---------------------------|-----------------------------------|--------|-----------------------------------------------|----------------------|-----------------------------|--------------------------|------------------------------|
| Análise de Código (SAST) | CodeQL (Code Scanning) | Análise Semântica Profunda (CodeQL) | ✅ | Job `codeql` em `orchestrator.yml` | `push`, `pull_request` | Security > Code scanning alerts | Detecção precoce de vulnerabilidades | Adicionar linguagens adicionais (TS explícito) & queries custom corporativas |
| Análise de Código (SAST) | Semgrep | Motor de Regras Dinâmicas (Semgrep) | ✅ | Job `semgrep` em `orchestrator.yml` (SARIF) | `push`, `pull_request` | Security > Code scanning alerts (tool=semgrep) | Cobertura complementar de padrões inseguros | Curadoria interna + classificação severidade |
| Gerenciamento de Segredos | Secret Scanning | Vigilância de Segredos (Detecção) | 🟡 | Config padrão (não codificado) | Contínuo | Security > Secret scanning | Bloqueio pós-push / alerta | Ativar Push Protection (pre-push) |
| Push Protection | Bloqueio automático | Proteção Proativa de Segredos | 🔴 | Não configurado | N/A | Settings (Security & analysis) | Evita entrada de credenciais | Habilitar push protection + políticas de exceção |
| Gestão de Dependências | Dependabot Alerts & Security Updates | Governança de Dependências Segura | ✅ | `.github/dependabot.yml` | Agendado pelo motor Dependabot | Security > Dependabot alerts / PRs | Remediação contínua de CVEs | Incluir ecossistema `github-actions` |
| Inventário de Dependências | Dependency Graph & SBOM | Inventário Formal & SBOM CycloneDX | ✅ | Job `sbom` (gera `sbom/combined.json`) | `push`, `pull_request` | Artifact "sbom" / Insights > Dependency graph | Transparência e compliance | Anexar SBOM à imagem (attestation) |
| Proteção da Cadeia | Signed Commits / Tags | Assinatura Criptográfica / Proveniência | 🔴 | Não configurado | N/A | Commits (falta selo Verified) | Integridade da autoria | Exigir assinaturas em branch protection |
| Políticas de Segurança | Security Overview | Painel de Segurança Agregado | 🟡 | Nativo (org) | Contínuo | Org > Security Overview | Visão macro de risco | Integrar múltiplos repositórios & policy reviews |

---

### ⚙️ Pilar: CI/CD (Automação, Build, Deploy)

| Categoria | Funcionalidade | Denominação Profissional Aplicada | Status | Implementação Técnica | Momento / Trigger | Evidência | Valor | Próximo Incremento |
|-----------|---------------|-----------------------------------|--------|----------------------|------------------|----------|-------|-------------------|
| Orquestração CI/CD | GitHub Actions | Pipeline Orquestrado Unificado | ✅ | `orchestrator.yml` | `push`, `pull_request`, manual | Actions > Orchestrator Pipeline | Integra Qualidade + Segurança | Modularizar blocos reutilizáveis |
| Infraestrutura de Execução | Hosted Runners | Execução Padronizada em Runners Gerenciados | ✅ | `runs-on: ubuntu-latest` | Em cada job | Logs de cada job | Consistência e custo zero manutenção | Introduzir matriz (Node 18/20) |
| Gestão de Ambientes | Environments & Protection Rules | Estrutura de Ambientes (QA/PRD – Simulada) | 🟡 | Jobs `deploy-qa`, `deploy-prd` | Branch `develop` / `master` | Actions (jobs) / Environments | Suporte a gates de promoção | Ativar approvals / secrets críticos |
| Reutilização de Workflows | Reusable / Composite Actions | Componentização de Pipelines | 🔴 | Não implementado | N/A | N/A | Redução de duplicação | Extrair steps comuns (instalação / cobertura) |
| Artefatos e Cache | Upload/Download / Cache | Persistência & Aceleração de Ciclos | ✅ | Upload coverage, SBOM, build; `actions/setup-node` cache | Durante testes/build | Artifacts / Logs cache | Menor tempo e reprodutibilidade | Definir políticas de retenção/expurgo |
| Deploy Automatizado | Deployments API / Actions | Publicação de Aplicação (Placeholder) | 🟡 | Steps simulados de deploy | Ao fim (branches alvo) | Logs de deploy simulado | Demonstração de gating | Integrar cloud real (Azure/K8s) |

---

### 🧪 Pilar: Qualidade, Testes & Cobertura de Código

| Categoria | Funcionalidade | Denominação Profissional Aplicada | Status | Implementação | Execução | Evidência | Valor | Próximo Incremento |
|-----------|---------------|-----------------------------------|--------|--------------|----------|----------|-------|-------------------|
| Execução de Testes | Testes Automatizados | Bateria Unitária & Integração (Jest) | ✅ | Jobs `test-backend`, `test-frontend` | `push` / `pull_request` | Logs + Artifacts coverage | Detecção precoce de regressões | Adicionar testes de contrato / e2e |
| Cobertura de Código | Coverage Gate & Consolidation | Métrica Combinada Multi-Serviço + Gate (>=80%) | ✅ | Job `coverage-gate` | Após testes | Badge JSON (branch `badges`) | Controle de qualidade objetivo | Tornar Required Check (branch protection) |
| Cobertura Diferencial | Diff Coverage (Changed Lines) | Avaliação de Risco Incremental | ✅ | Job `diff-coverage` | Em PR / push | PR comment + badge | Previne introdução de dívida | Threshold adaptativo (hotspots) |
| Comentário de PR | Coverage Delta Comment | Feedback Contextual Dinâmico | ✅ | Step `PR Coverage Delta Comment` | PR | PR conversation | Transparência quantitativa | Adicionar notas de tendência |
| Qualidade Estática | Linting / Style Enforcement | Gate de Código Limpo (ESLint) | ✅ | Job `lint` | Início pipeline | Logs / Status Check | Redução de débito introdutório | Integrar formatação automática |
| Relatórios Unificados | SARIF Reports Upload | Consolidação SAST Multi-Ferramenta | ✅ | CodeQL + Semgrep SARIF | `push` / PR | Security > Code scanning | Centro único de findings | Classificação com auto triagem |
| Qualidade Externa | SonarCloud Integration | Análise Holística (Bugs/Smells/Coverage) | ✅ (condicional) | Job `sonar` | Se token presente | SonarCloud Dashboard | Métrica externa comparativa | Export badge para README |

---

### 🔍 Pilar: Observabilidade, Monitoramento & Auditoria

| Categoria | Funcionalidade | Denominação Profissional | Status | Implementação | Evidência | Evolução |
|-----------|---------------|--------------------------|--------|--------------|----------|---------|
| Auditoria Centralizada | Audit Logs | Rastreabilidade Organizacional | 🟡 | Nativo (org) | Org Audit Logs | Integrar exportação para SIEM |
| Integração SIEM | Export Logs API/Webhook | Telemetria de Segurança Externa | 🔴 | Não aplicado | N/A | Configurar webhooks / pipeline ingest |
| Alertas de Segurança | Security Alerts (CodeQL/Dependabot) | Centralização de Vulnerabilidades | ✅ | CodeQL + Dependabot | Security > Alerts | Enriquecer priorização c/ labels |
| Insights Operacionais | Repository Insights / Traffic | Métricas de Contribuição | 🟡 | Nativo | Insights aba | Monitorar PR tempo médio |
| Health Pipelines | Workflow Run Insights | Observabilidade de Performance de CI | ✅ | Actions UI | Actions run detail | Criar relatório mensal síntese |

---

### 🏛️ Pilar: Governança, Compliance & Gestão

| Categoria | Funcionalidade | Denominação Profissional | Status | Implementação | Evidência | Próximo Passo |
|-----------|---------------|--------------------------|--------|--------------|----------|--------------|
| Branch Protection Rules | Regras / Required Checks | Política de Qualidade Obrigatória | 🔴 | Não configurado (UI Settings) | N/A | Definir lista de checks críticos |
| Required Status Checks | Gate Formal de Merge | Enforcements de Qualidade & Segurança | 🔴 | N/A (depende de Branch Protection) | PR (não bloqueia ainda) | Ativar p/ `lint`, `typecheck`, `coverage-gate`, `diff-coverage`, `codeql`, `semgrep`, `tests` |
| Organization Policies | Repository Policies | Padronização Global | 🟡 | Parcial (CODEOWNERS, dependabot) | Arquivos de governança | Ampliar naming / visibilidade padrão |
| Identidade & Acesso | SSO / SCIM / LDAP | Gestão Central de Identidades | 🔴 | Fora do escopo POC | N/A | Integrar AD corporativo (org-level) |
| Auditoria de Conformidade | Enterprise Audit & Retention | Retenção Evidencial | 🔴 | Não aplicado | N/A | Definir políticas de retenção |
| Governança em Largura | EMU | Usuários Gerenciados | 🔴 | Não aplicável nesta POC | N/A | Avaliar se org exige EMU |
| Política de Revisão | Code Owners / PR Template | Accountability de Revisões | ✅ | `CODEOWNERS` / `pull_request_template.md` | Ao abrir PR | Expandir checklist (segurança, performance) |
| Classificação Automática | Labeler | Taxonomia Automatizada de PRs | ✅ | `.github/labeler.yml` | PR labels | Refinar convenções |

---

### 💡 Pilar: Experiência do Desenvolvedor (Dev Experience)

| Categoria | Funcionalidade | Denominação Profissional | Status | Implementação | Valor | Evolução |
|-----------|---------------|--------------------------|--------|--------------|-------|---------|
| Ambientes de Desenvolvimento | GitHub Codespaces | Ambiente Efêmero Padronizado | 🔴 | Ausente | Onboarding acelerado | Adicionar `.devcontainer/` |
| Assistente de IA | GitHub Copilot | Aceleração Cognitiva de Código | 🟡 | Fora do repositório | Produtividade | Definir política de uso seguro |
| Revisões de Código | Pull Requests / Suggested Changes | Ciclo Colaborativo de Qualidade | ✅ | Uso padrão + comentários automáticos | Menor tempo de feedback | Integrar templates de review avançado |
| Automação de Revisões | Code Owners / Assignment | Responsabilidade Estruturada | ✅ | `CODEOWNERS` | Revisores automáticos | Integrar regras por caminho crítico |
| Integração IDE | VS Code Extensions / GitHub CLI | Produtividade de Fluxo Local | 🟡 | (Suposto uso) | Execução direta | Documentar guia CLI |

---

### 📦 Pilar: Pacotes, Registros & Artefatos

| Categoria | Funcionalidade | Denominação Profissional | Status | Implementação | Evidência | Evolução |
|-----------|---------------|--------------------------|--------|--------------|----------|---------|
| Registro de Pacotes | GitHub Packages / GHCR | Repositório de Imagens Backend | ✅ | Job `package-backend` (GHCR) | Aba Packages | Tag semântico + multi-arch |
| Controle de Acesso | Package Permissions | Escopo de Consumo Controlado | 🟡 | Padrão (TOKEN) | Packages UI | Definir permissões refinadas org | 
| Vulnerability Scanning de Pacotes | Dependabot + Alerts | Supervisão de Artefatos Publicados | ✅ | Dependabot / Security | Alerts section | Adicionar scanning em imagens (Trivy) |

---

### 🔗 Pilar: Integrações & Extensibilidade

| Categoria | Funcionalidade | Denominação Profissional | Status | Implementação | Evolução |
|-----------|---------------|--------------------------|--------|--------------|---------|
| Marketplace de Apps | GitHub Apps / OAuth | Ecossistema Complementar | 🔴 | Não aplicado | Integrar notificação PR falho |
| APIs & Webhooks | REST / GraphQL Interfaces | Automação Programática | 🔴 | Não codificado | Criar export de métricas coverage |
| GitHub CLI | Automação Linha de Comando | Eficiência Operacional | 🟡 | Uso tácito (não documentado) | Adicionar guia `gh` commands |

---

### 🧰 Pilar: Enterprise Server / Administração

| Categoria | Funcionalidade | Denominação | Status | Observação |
|-----------|---------------|------------|--------|------------|
| GitHub Connect | Integração Cloud / On-Prem | Híbrido de Segurança | 🔴 | Fora do escopo Cloud-only |
| Administração de Instância | Backup / Clustering | Resiliência Operacional | 🔴 | Não aplicável nesta POC |
| Atualizações Gerenciadas | Patch Lifecycle | Hygiene de Plataforma | 🔴 | Gestão pela plataforma SaaS |

---

### 📈 Pilar: Métricas & Analytics

| Categoria | Funcionalidade | Denominação Profissional | Status | Implementação | Evidência | Evolução |
|-----------|---------------|--------------------------|--------|--------------|----------|---------|
| Repository Insights | Métricas de Contribuição | Análise de Aderência | 🟡 | Nativo | Insights | Relatórios periódicos |
| Contribuição por Equipe | Produtividade & Lead Time | Engenharia de Fluxo | 🔴 | Não instrumentado | N/A | Coletar via API + dashboards |
| Coverage & Test Quality Dashboard | SonarCloud / Badges Internos | Observabilidade de Qualidade | ✅ | Job `sonar` + branch `badges` | Sonar + JSON badges | Visual externo gráfico (pages) |
| Histórico de Cobertura | Série Temporal Estruturada | Evolução de Risco | ✅ | JSON em `badges/history/*.json` | Branch `badges` | Dashboard visual (gráfico) |

---

### 🔬 Diferenciação: Execução CodeQL (Pipeline) vs Plataforma Code Scanning

| Aspecto | Job CodeQL (YAML) | Plataforma Code Scanning (UI) | Sinergia de Valor |
|---------|-------------------|-------------------------------|------------------|
| Origem | `orchestrator.yml` (job `codeql`) | Security > Code scanning alerts | Feedback automatizado contínuo |
| Formato de Saída | SARIF | Indexação / Classificação | Correlação multi-ferramenta (CodeQL + Semgrep) |
| Frequência | Cada push / PR | Estado persistente por branch | Histórico de regressões prevenido |
| Escalabilidade | Ajustável por linguagens e queries | Curadoria visual de resultados | Pipeline evolui → UI reflete sem esforço extra |
| Governança | Pode falhar build (se policy futura) | Gestão de supressões / triagem | Integração futura de aprovadores de risco |

---

### 🔐 Required Status Checks – Recomendações
Checks candidatos a obrigatórios (Branch Protection):
1. `lint`
2. `typecheck`
3. `test-backend`
4. `test-frontend`
5. `coverage-gate`
6. `diff-coverage`
7. `codeql`
8. `semgrep`
9. (Opcional) `sonar` quando token sempre presente

Benefício: Impede merge que reduza padrão mínimo de qualidade, segurança ou cobertura.

---

### 🔁 Fluxo Operacional de Cobertura (Visão de Governaça)
1. Geração de cobertura individual (backend/frontend).  
2. Fusão e aplicação de política (threshold >=80%) no job `coverage-gate`.  
3. Publicação de badges e histórico por branch (`badges`).  
4. Cálculo diferencial (linhas alteradas) e validação incremental (`diff-coverage`).  
5. Comentário automatizado em PR apresentando delta vs baseline do branch alvo.  
6. Falha do pipeline impede merge (quando checks tornados obrigatórios).  

---

### 📌 Principais Oportunidades de Evolução (Roadmap Incremental)
| Prioridade | Ação | Racional Executivo |
|-----------|------|--------------------|
| Alta | Ativar Branch Protection + Required Checks | Formaliza padrões mínimos e reduz risco de regressão. |
| Alta | Push Protection (segredos) | Evita incidentes de segurança de alto impacto. |
| Média | Assinatura / Attestation de Imagens | Eleva confiança na cadeia de distribuição. |
| Média | Devcontainer (Codespaces-ready) | Acelera onboarding e alinhamento de ambiente. |
| Média | Dashboard de Histórico (coverage trend) | KPI executivo contínuo para liderança. |
| Baixa | Reusable actions para instalação / cobertura | Redução de manutenção futura. |

---

### 🎯 Sumário Executivo
A POC estabelece uma fundação sólida de Segurança (SAST duplo, SBOM), Qualidade (cobertura consolidada + diferencial + lint) e Automação (pipeline orquestrado com artefatos e publicação de métricas). As maiores alavancas de maturidade residem em formalização de políticas (branch protection & required checks), fortalecimento de supply chain (assinaturas, attestations) e incremento da experiência do desenvolvedor (devcontainer, dashboards analíticos). O modelo atual é extensível, auditável e apto a escalar para múltiplos serviços.

---

Documento gerado automaticamente – ajustar logotipos / branding conforme guia corporativo caso necessário.

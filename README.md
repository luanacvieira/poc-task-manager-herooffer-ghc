# poc-task-manager-herooffer-ghc

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

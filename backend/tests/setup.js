// Arquivo de setup antigo substituído por setup-unit.js.
// Mantido apenas como stub para evitar falhas caso alguma referência exista.
// Não inicializa MongoMemoryServer para tornar os testes determinísticos.
if (process.env.DEBUG_TEST_SETUP) {
  console.log('Stub setup.js executado (sem MongoDB).');
}
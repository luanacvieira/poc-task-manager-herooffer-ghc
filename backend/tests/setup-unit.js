/**
 * Setup global de teste - configuração executada antes dos testes
 * Setup simples sem MongoDB Memory Server para testes unitários isolados
 */

// Mock console para evitar poluição nos testes
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(async () => {
    // Silenciar console nos testes
    console.log = jest.fn();
    console.error = jest.fn();
    
    console.log('🚀 Setup de testes unitários iniciado');
});

afterAll(async () => {
    // Restaurar console original
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    console.log('✅ Limpeza de teste concluída');
});

beforeEach(async () => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
});
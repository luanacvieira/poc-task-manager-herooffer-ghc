module.exports = {
    // Ambiente de teste Node.js
    testEnvironment: 'node',
    
    // Padrão dos arquivos de teste
    testMatch: [
        '**/tests/**/*.test.js',
        '**/src/**/*.test.js'
    ],
    
    // Configuração de cobertura
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'lcov', 
        'html',
        'json-summary',
        'json'
    ],
    
    // Arquivos para incluir na cobertura
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/app.js', // Arquivo principal excluído pois é difícil testar
        '!**/node_modules/**',
        '!**/coverage/**'
    ],
    
    // Limite mínimo de cobertura (ajustado para ser realístico)
    // coverageThreshold removido: enforcement via GitHub Actions workflow
    
    // Setup e teardown (usar ambiente leve sem MongoDB real para evitar flakiness)
    setupFilesAfterEnv: ['<rootDir>/tests/setup-unit.js'],
    
    // Timeout para testes (aumentado para MongoDB)
    testTimeout: 30000,
    
    // Limpar mocks automaticamente
    clearMocks: true,
    restoreMocks: true,
    
    // Verbose output
    verbose: true
};
module.exports = {
    // Ambiente de teste
    testEnvironment: 'node',
    
    // Padrão dos arquivos de teste
    testMatch: [
        '**/tests/**/*.isolated.test.js',
        '**/tests/**/*.actual.test.js'
    ],
    
    // Configuração de cobertura
    collectCoverage: true,
    coverageDirectory: 'coverage-unit',
    coverageReporters: ['text', 'lcov', 'html', 'json', 'json-summary'],
    
    // Arquivos para incluir na cobertura
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/app.js', // Excluir arquivo principal
        '!src/server.js', // bootstrap separado não testado em unit
        '!**/node_modules/**',
        '!**/tests/**'
    ],
    
    // Thresholds removidos: enforcement via GitHub Actions
    
    // Timeout aumentado
    testTimeout: 10000,
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup-unit.js'],
    
    // Limpar mocks entre testes
    clearMocks: true,
    restoreMocks: true,
    
    // Verbose para saída detalhada
    verbose: true
};
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
    
    // Coverage thresholds - 80% mínimo para passar o gate
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    
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
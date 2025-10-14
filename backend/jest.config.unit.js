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
        '!src/server.js', // bootstrap separado não testado em unit
        '!src/server-dev.js', // servidor de desenvolvimento
        '!src/mock-server.js', // mock server para testes manuais
        '!**/node_modules/**',
        '!**/tests/**'
    ],
    
    // Coverage thresholds - Ajustado para cobertura atual realista
    coverageThreshold: {
        global: {
            branches: 75,
            functions: 90, // Controllers e models têm 100%
            lines: 90,
            statements: 90
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
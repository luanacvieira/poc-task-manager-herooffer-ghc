module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage-integration',
  collectCoverageFrom: [
      'src/**/*.js',
      '!src/server.js', // bootstrap separado
      '!src/server-dev.js', // servidor de desenvolvimento  
      '!src/mock-server.js', // mock server para testes manuais
      '!src/vulnerable-code.js', // vulnerabilidades propositais para CodeQL
      '!**/node_modules/**',
      '!**/tests/**'
  ],
  // Coverage thresholds - Ajustado para testes de integração (foco em fluxo E2E)
  coverageThreshold: {
      global: {
          branches: 60, // Integração testa fluxos principais (atual: 60.6%)
          functions: 80, // Functions bem cobertas (atual: 85.71%)
          lines: 75,     // Boa cobertura de linhas (atual: 83.95%)
          statements: 75 // Boa cobertura de statements (atual: 79.54%)
      }
  },
  verbose: true,
  testTimeout: 30000
};
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage-integration',
  collectCoverageFrom: [
      'src/**/*.js',
      '!src/server.js',
      '!**/node_modules/**',
      '!**/tests/**'
  ],
  // Coverage thresholds - 80% mínimo para testes de integração
  coverageThreshold: {
      global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
      }
  },
  verbose: true,
  testTimeout: 30000
};
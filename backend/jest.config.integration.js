module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.js'],
  collectCoverage: false,
  verbose: true,
  testTimeout: 30000
};
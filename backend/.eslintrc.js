module.exports = {
  env: { es2022: true, node: true, jest: true },
  extends: ['eslint:recommended', 'plugin:security/recommended'],
  plugins: ['security'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['coverage-unit/', 'coverage/', 'node_modules/'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  }
};

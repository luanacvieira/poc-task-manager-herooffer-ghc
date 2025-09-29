module.exports = {
  root: true,
  ignorePatterns: ['node_modules/', 'coverage/', 'coverage-unit/', 'dist/', 'build/'],
  env: {
    es2022: true,
    node: true,
    browser: false,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  overrides: [
    {
      files: ['backend/**/*.js'],
      env: { node: true, jest: true },
      plugins: ['security'],
      extends: ['plugin:security/recommended']
    },
    {
      files: ['frontend/src/**/*.{ts,tsx}'],
      env: { browser: true, jest: true },
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      settings: { react: { version: 'detect' } }
    }
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'error'
  }
};

// Flat ESLint config (ESLint v9+) consolidating backend (JS) and frontend (TS/React)
const js = require('@eslint/js');
// Graceful load of 'globals' (avoid hard crash if dependency resolution faltered in CI)
let globals = {};
try {
  globals = require('globals');
} catch (e) {
  // Fallback to empty object; rules will still run, only global detection reduced.
  console.warn('[eslint] Warning: module "globals" not found. Using empty globals map.');
}
function safeRequire(name, fallback) {
  try { return require(name); } catch(e){
    console.warn(`[eslint] Warning: module \"${name}\" not found. Using fallback.`);
    return fallback || {};
  }
}
const tseslint = safeRequire('@typescript-eslint/eslint-plugin');
const tsParser = safeRequire('@typescript-eslint/parser');
const reactPlugin = safeRequire('eslint-plugin-react');
const reactHooks = safeRequire('eslint-plugin-react-hooks');
const security = safeRequire('eslint-plugin-security');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'coverage-unit/**',
      'dist/**',
      'build/**'
    ]
  },
  // Backend JS (Node)
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
  globals: { ...(globals.node||{}), ...(globals.es2021||{}), ...(globals.jest||{}) }
    },
    plugins: { security },
    rules: {
      ...js.configs.recommended.rules,
      ...security.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },
  // Frontend TS/TSX (React)
  {
    files: ['frontend/src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
  parser: tsParser && tsParser.parse ? tsParser : tsParser, // safe if missing
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
  globals: { ...(globals.browser||{}), ...(globals.es2021||{}), ...(globals.jest||{}) }
    },
    plugins: { '@typescript-eslint': tseslint, react: reactPlugin, 'react-hooks': reactHooks },
    rules: {
      ...js.configs.recommended.rules,
  ...(tseslint.configs?.recommended?.rules||{}),
  ...(reactPlugin.configs?.recommended?.rules||{}),
  ...(reactHooks.configs?.recommended?.rules||{}),
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    },
    settings: { react: { version: 'detect' } }
  }
];

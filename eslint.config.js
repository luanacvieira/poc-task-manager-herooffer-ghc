// Flat ESLint config (ESLint v9+) consolidating backend (JS) and frontend (TS/React)
import js from '@eslint/js';
import globals from 'globals';

// React / TS plugins still use CommonJS export style; import via require() fallback when needed
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import security from 'eslint-plugin-security';

export default [
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
      globals: { ...globals.node, ...globals.es2021, ...globals.jest }
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
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: { ...globals.browser, ...globals.es2021, ...globals.jest }
    },
    plugins: { '@typescript-eslint': tseslint, react: reactPlugin, 'react-hooks': reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    },
    settings: { react: { version: 'detect' } }
  }
];

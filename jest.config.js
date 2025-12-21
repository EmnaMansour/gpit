/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/jest-tests/**/*.test.ts'],  // Seulement ton dossier de tests simples

  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.ts',                          // ← FORCE : tous les .ts
    '**/*.tsx',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.config.ts',                  // exclut jest.config.ts, tsconfig.json, etc.
    '!**/cypress/**',
    '!**/jest-tests/**'                 // optionnel : n'inclut pas les tests eux-mêmes
  ],

  coverageReporters: ['lcov', 'text', 'html'],
  coverageDirectory: '<rootDir>/coverage',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
};

module.exports = config;
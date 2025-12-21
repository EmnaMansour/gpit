/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',  // Backend Node, pas jsdom pour l’instant

  // Cherche les tests seulement dans des dossiers dédiés
  roots: ['<rootDir>/backend', '<rootDir>/frontend'],

  testMatch: [
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.js',
    '**/*.test.ts',
    '**/*.test.js',
    '**/*.spec.ts',
    '**/*.spec.js'
  ],

  // Ignore complètement les dossiers problématiques pour l’instant
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/cypress/'
  ],

  // Transforme aussi certains node_modules si besoin (ex: testing-library)
  transformIgnorePatterns: [
    '/node_modules/(?!@testing-library)'
  ],

  collectCoverage: true,
  collectCoverageFrom: [
    'backend/src/**/*.{ts,js}',
    'backend/**/*.ts',
    'frontend/src/**/*.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.config.{ts,js}',
    '!**/cypress/**'
  ],

  coverageReporters: ['lcov', 'text', 'html'],
  coverageDirectory: '<rootDir>/coverage',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  clearMocks: true,
  verbose: false,  // Mets à true si tu veux plus de logs
};

module.exports = config;
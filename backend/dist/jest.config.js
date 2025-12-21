"use strict";

module.exports = {
  preset: 'ts-jest',                  // Important : active ts-jest pour compiler TS
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]s$',  // Accepte .test.ts, .spec.ts, .test.js etc.
  
  // Ou plus simple :
  // testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).[jt]s?(x)'],

  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',       // Inclut TS et JS sources
    '*.{ts,js}',                      // Fichiers à la racine
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],

  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['lcov', 'text', 'html'],  // LCOV obligatoire pour SonarCloud

  verbose: true,

  // Optionnel mais recommandé
  clearMocks: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
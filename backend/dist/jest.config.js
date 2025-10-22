"use strict";
module.exports = {
    testEnvironment: 'node', // Environnement Node pour backend
    roots: ['<rootDir>/__tests__'], // Tous les tests sont dans __tests__
    testMatch: ['**/*.test.js'], // Tous les fichiers *.test.js
    collectCoverage: true, // Collecter la couverture
    collectCoverageFrom: [
        'src/**/*.js', // Tous les fichiers source JS
        '*.js', // Fichiers JS à la racine
        '!**/node_modules/**'
    ],
    coverageDirectory: '<rootDir>/coverage',
    verbose: true
};

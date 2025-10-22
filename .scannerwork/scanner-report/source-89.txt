module.exports = {
  testEnvironment: 'node',      // environnement Node.js
  verbose: true,                // logs détaillés
  testMatch: ['**/__tests__/**/*.test.js'], // tous les fichiers de test
  collectCoverage: true,        // activer la couverture
  coverageDirectory: 'coverage',// dossier pour les rapports
  coverageReporters: ['lcov', 'text'], // format lcov pour Sonar
};

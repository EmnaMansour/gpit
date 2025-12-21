import { defineConfig } from 'cypress';
import codeCoverageTask from '@cypress/code-coverage/task';  // ← Import moderne (plus fiable)

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,
    responseTimeout: 30000,
    requestTimeout: 10000,
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',

    setupNodeEvents(on, config) {
      // ← Utilise l'import direct (meilleure pratique 2024-2025)
      codeCoverageTask(on, config);

      // Si tu as d'autres tasks (ex: grep, allure...), ajoute-les ici

      return config;
    },
  },

  // Tu peux garder la section component si tu fais des tests de composants
  // Sinon, tu peux la supprimer pour alléger
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
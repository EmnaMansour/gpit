import { defineConfig } from 'cypress';
// @ts-ignore: module has no type declarations or may not be installed in this workspace
import codeCoverageTask from '@cypress/code-coverage/task';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173/',
    chromeWebSecurity: false,
    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,
    setupNodeEvents(on, config) {
      // 🔥 Active la collecte du code coverage
      codeCoverageTask(on, config);

      return config;
    },
    supportFile: 'cypress/support/e2e.ts',
  },
});

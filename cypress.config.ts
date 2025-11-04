import { defineConfig } from "cypress";

export default defineConfig({
  // ⚠️ Retirez toute la section component si vous ne faites pas de tests de composants
  e2e: {
    baseUrl: "http://localhost:5173",
    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,
    responseTimeout: 30000,
    requestTimeout: 10000,
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",

    setupNodeEvents(on, config) {
      require("@cypress/code-coverage/task")(on, config);
      return config;
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});

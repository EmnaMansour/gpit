// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    defaultCommandTimeout: 30000,  // Augmenté à 30s
    pageLoadTimeout: 60000,        // Augmenté à 60s  
    responseTimeout: 30000,
    requestTimeout: 10000,         // Augmenté à 10s
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,

    setupNodeEvents(on, config) {
      return config
    },
  },
})
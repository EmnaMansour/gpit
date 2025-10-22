import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173/',
    chromeWebSecurity: false,
    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,
    setupNodeEvents(on, config) {
      // tu peux ajouter des hooks ici si besoin
    },
  },
})

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginBypass(): Chainable<void>;
    }
  }
}

// Commande pour simuler un login et mocker le dashboard
Cypress.Commands.add('loginBypass', () => {
  // Visiter la racine de l'app
  cy.visit('/');

  // Remplir le localStorage avec un token et un utilisateur factice
  cy.window().then((win) => {
    win.localStorage.setItem('token', 'fake-test-token');
    win.localStorage.setItem(
      'user',
      JSON.stringify({
        id: 1,
        email: 'admin@gmail.com',
        role: 'admin',
        isAuthenticated: true,
      })
    );
  });

  // Intercepter les appels GET vers /dashboard et renvoyer un HTML mocké
  cy.intercept('GET', '/dashboard*', {
    statusCode: 200,
    headers: { 'content-type': 'text/html' },
    body: `
      <html>
        <body>
          <h1>Dashboard</h1>
          <div id="root">Dashboard content</div>
        </body>
      </html>
    `,
  }).as('dashboardMock');
});

export {};

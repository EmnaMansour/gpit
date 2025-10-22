Cypress.Commands.add('loginBypass', () => {
  cy.visit('/');
  cy.window().then((win) => {
    // Injecter l'authentification directement
    win.localStorage.setItem('token', 'fake-test-token');
    win.localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'admin@gmail.com',
      role: 'admin',
      isAuthenticated: true
    }));
  });
  
  // Mock du dashboard pour éviter l'erreur JSON
  cy.intercept('GET', '/dashboard*', {
    statusCode: 200,
    headers: { 'content-type': 'text/html' },
    body: '<html><body><h1>Dashboard</h1><div id="root">Dashboard content</div></body></html>'
  });
});
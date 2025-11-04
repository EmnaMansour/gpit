/// <reference types="cypress" />

describe('Dashboard Tests', () => {
  const login = (email: string, password: string) => {
    cy.visit('/', { timeout: 30000 });
    cy.get('body', { timeout: 10000 }).should('exist');

    cy.window().then((win) => {
      win.history.pushState({}, '', '/login');
    });
    cy.reload();

    cy.get('input[name=email], input[type=email]', { timeout: 10000 })
      .should('be.visible')
      .type(email);
    cy.get('input[name=password], input[type=password]')
      .should('be.visible')
      .type(password);
    cy.get('button')
      .contains('Se connecter')
      .should('be.visible')
      .click();

    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    cy.get('body').should('exist');
  };

  const checkDashboardElements = (role: 'Admin' | 'Technicien' | 'Employé') => {
    // On attend que le dashboard charge les incidents depuis l'API
    cy.intercept('GET', '**/api/incidents*').as('getIncidents');
    cy.wait('@getIncidents', { timeout: 20000 });

    cy.wait(2000); // sécurité pour que React affiche tout

    if (role === 'Admin') {
      cy.contains(/total utilisateurs/i, { timeout: 15000 }).should('exist');
      cy.contains(/total équipements/i, { timeout: 15000 }).should('exist');
      cy.contains(/total incidents/i, { timeout: 15000 }).should('exist');
      cy.contains(/incidents actifs/i, { timeout: 15000 }).should('exist');
      cy.contains(/incidents récents/i, { timeout: 15000 }).should('exist');
      cy.contains(/utilisateurs récents/i, { timeout: 15000 }).should('exist');
    } else if (role === 'Technicien') {
      cy.contains(/total équipements/i, { timeout: 15000 }).should('exist');
      cy.contains(/total incidents/i, { timeout: 15000 }).should('exist');
      cy.contains(/incidents actifs/i, { timeout: 15000 }).should('exist');
      cy.contains(/incidents récents/i, { timeout: 15000 }).should('exist');
    } else if (role === 'Employé') {
      cy.contains(/incident/i, { timeout: 15000 }).should('exist');
      cy.contains(/incidents actifs/i, { timeout: 15000 }).should('exist');
      cy.contains(/incidents récents/i, { timeout: 15000 }).should('exist');
    }
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it('Admin Dashboard', () => {
    login('admin@gmail.com', 'admin');
    checkDashboardElements('Admin');
  });

  it('Technicien Dashboard', () => {
    login('technicien@gmail.com', 'technicien');
    checkDashboardElements('Technicien');
  });

  it('Employé Dashboard', () => {
    login('employe@gmail.com', 'employe');
    checkDashboardElements('Employé');
  });
});

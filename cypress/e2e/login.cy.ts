/// <reference types="cypress" />

describe('Dashboard Tests', () => {
  // Fonction de login adaptée pour React Router
  const login = (email: string, password: string) => {
    // Toujours commencer par la racine pour charger l'app React
    cy.visit('/', { timeout: 30000 });
    
    // Attendre que l'application React soit chargée
    cy.get('body', { timeout: 10000 }).should('exist');
    
    // Naviguer vers /login via le routeur React
    cy.window().then((win) => {
      win.history.pushState({}, '', '/login');
    });
    
    // Ou utiliser un reload pour forcer le routage
    cy.reload();

    // Vérifier que le formulaire de login est présent
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

    // Attendre la redirection vers le dashboard
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    
    // Vérifier que le dashboard est chargé
    cy.get('body').should('exist');
    cy.wait(3000); // Pause pour le chargement complet
  };

  // Vérifie les éléments du dashboard selon le rôle
  const checkDashboardElements = (role: 'Admin' | 'Technicien' | 'Employé') => {
    // D'abord vérifier que nous sommes sur le dashboard
    cy.url().should('include', '/dashboard');
    
    if (role === 'Admin') {
      cy.contains('Total Utilisateurs', { timeout: 10000 }).should('exist');
      cy.contains('Technicien', { timeout: 10000 }).should('exist');
      cy.contains('Employé', { timeout: 10000 }).should('exist');
      cy.contains('Total Équipements', { timeout: 10000 }).should('exist');
      cy.contains('Total Incidents', { timeout: 10000 }).should('exist');
      cy.contains('Incidents Actifs', { timeout: 10000 }).should('exist');
      cy.contains('Incidents Récents', { timeout: 10000 }).should('exist');
      cy.contains('Utilisateurs Récents', { timeout: 10000 }).should('exist');
    } else if (role === 'Technicien') {
      cy.contains('Total Équipements', { timeout: 10000 }).should('exist');
      cy.contains('Total Incidents', { timeout: 10000 }).should('exist');
      cy.contains('Incidents Actifs', { timeout: 10000 }).should('exist');
      cy.contains('Incidents Récents', { timeout: 10000 }).should('exist');
      cy.contains('Utilisateurs Récents').should('not.exist');
    } else if (role === 'Employé') {
      cy.contains('Incident', { timeout: 10000 }).should('exist');
      cy.contains('Incidents Actifs', { timeout: 10000 }).should('exist');
      cy.contains('Incidents Récents', { timeout: 10000 }).should('exist');

      cy.contains('Total Équipements').should('not.exist');
      cy.contains('Utilisateurs Récents').should('not.exist');
      cy.contains('Technicien').should('not.exist');
    }
  };

  beforeEach(() => {
    // Nettoyer le localStorage et session avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it('Admin Dashboard - Vérifie les éléments spécifiques à l\'admin', () => {
    login('admin@gmail.com', 'admin');
    checkDashboardElements('Admin');
  });

  it('Technicien Dashboard - Vérifie les éléments spécifiques au technicien', () => {
    login('technicien@gmail.com', 'technicien');
    checkDashboardElements('Technicien');
  });

  it('Employé Dashboard - Vérifie les éléments spécifiques à l\'employé', () => {
    login('employe@gmail.com', 'employe');
    checkDashboardElements('Employé');
  });

  it('DEBUG - Afficher le contenu de la page employé', () => {
    login('employe@gmail.com', 'employe');
    cy.wait(5000);
    
    // Prendre une capture d'écran pour debug
    cy.screenshot('dashboard-employe');
    
    cy.get('body').then(($body) => {
      console.log('=== TEXTE COMPLET DE LA PAGE EMPLOYÉ ===');
      console.log($body.text());
      
      // Afficher aussi tous les éléments visibles
      const visibleElements = $body.find('*:visible').toArray().map((el) => {
        const text = ((el as HTMLElement).innerText || '').trim();
        return text ? text : null;
      }).filter(Boolean);
      
      console.log('=== ÉLÉMENTS VISIBLES ===', visibleElements);
    });
  });
});
// ***********************************************
// Custom Cypress Commands
// ***********************************************

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type(email);
    cy.get('[data-cy=password-input]').type(password);
    cy.get('[data-cy=login-button]').click();
    cy.url().should('include', '/dashboard');
  });
});

// Check page has proper meta tags
Cypress.Commands.add('checkMetaTags', (tags: { title?: string; description?: string }) => {
  if (tags.title) {
    cy.title().should('include', tags.title);
  }
  if (tags.description) {
    cy.get('meta[name="description"]').should('have.attr', 'content');
  }
});

// Mock API response
Cypress.Commands.add('mockApi', (endpoint: string, response: object, status = 200) => {
  cy.intercept('GET', `**${endpoint}*`, {
    statusCode: status,
    body: response,
  }).as(`mock-${endpoint.replace(/\//g, '-')}`);
});

// Admin login command
Cypress.Commands.add('adminLogin', () => {
  const adminEmail = 'admin@arlink.online';
  const adminPassword = 'admin123';
  
  cy.session([adminEmail, 'admin'], () => {
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type(adminEmail);
    cy.get('[data-cy=password-input]').type(adminPassword);
    cy.get('[data-cy=login-button]').click();
    cy.url().should('include', '/admin');
  });
});


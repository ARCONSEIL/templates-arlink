// ***********************************************************
// This support file is processed and loaded automatically
// before your test files.
// ***********************************************************

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // Returning false prevents Cypress from failing the test
  if (err.message.includes('hydration') || err.message.includes('Minified React error')) {
    return false;
  }
  return true;
});

// Log test name before each test
beforeEach(() => {
  cy.log(`**Running: ${Cypress.currentTest.title}**`);
});

// Clear localStorage and cookies before each test
beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});


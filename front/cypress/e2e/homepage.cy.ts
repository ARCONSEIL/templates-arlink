/// <reference types="cypress" />

describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the homepage successfully', () => {
    cy.title().should('include', 'ARLinK');
    cy.get('footer').should('be.visible');
  });

  it('should display header with navigation', () => {
    cy.get('header').should('be.visible');
    cy.contains('ARLinK').should('be.visible');
  });

  it('should have skip link for accessibility', () => {
    cy.get('.skip-link').should('exist');
  });

  it('should have proper meta tags', () => {
    cy.get('meta[name="description"]').should('exist');
    cy.get('meta[property="og:title"]').should('exist');
    cy.get('meta[property="og:description"]').should('exist');
  });

  it('should have organization structured data', () => {
    cy.get('script[type="application/ld+json"]').should('exist');
  });

  it('should navigate to products page', () => {
    cy.get('a[href="/products"]').click();
    cy.url().should('include', '/products');
  });

  it('should navigate to stores page', () => {
    cy.get('a[href="/stores"]').click();
    cy.url().should('include', '/stores');
  });

  it('should navigate to login page', () => {
    cy.get('a[href="/login"]').click();
    cy.url().should('include', '/login');
  });
});

describe('Products Page', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('should load products page', () => {
    cy.title().should('include', 'Produits');
  });

  it('should display products grid', () => {
    cy.get('.products-grid').should('be.visible');
  });

  it('should have category filters', () => {
    cy.get('[class*="filter"]').should('be.visible');
  });
});

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should load login page', () => {
    cy.title().should('include', 'Connexion');
  });

  it('should display login form', () => {
    cy.get('form').should('be.visible');
    cy.get('[type="email"]').should('be.visible');
    cy.get('[type="password"]').should('be.visible');
  });

  it('should have guest route protection', () => {
    cy.url().should('include', '/login');
  });
});

describe('Accessibility', () => {
  it('should have skip link in DOM', () => {
    cy.visit('/');
    cy.get('.skip-link').should('exist');
  });

  it('should have proper heading hierarchy', () => {
    cy.visit('/');
    cy.get('h1').should('have.length', 1);
  });

  it('should have alt text on images', () => {
    cy.visit('/');
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt').and('not.be.empty');
    });
  });

  it('should have proper form labels', () => {
    cy.visit('/login');
    cy.get('form').within(() => {
      cy.get('label').should('be.visible');
    });
  });
});

describe('Mobile Responsiveness', () => {
  it('should display properly on mobile', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('header').should('be.visible');
    cy.get('footer').should('be.visible');
  });

  it('should have hamburger menu on mobile', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('[class*="hamburger"]').should('be.visible');
  });
});


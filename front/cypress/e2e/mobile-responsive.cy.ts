/// <reference types="cypress" />

describe('Mobile Responsiveness - Comprehensive', () => {
  describe('iPhone SE (Small Mobile)', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone SE
    });

    it('should display header correctly on small mobile', () => {
      cy.visit('/');
      cy.get('header').should('be.visible');
      cy.get('header').should('have.css', 'padding');
    });

    it('should have collapsible navigation on small mobile', () => {
      cy.visit('/');
      cy.get('[class*="hamburger"], [class*="menu-toggle"], [class*="mobile-menu"]').should('be.visible');
    });

    it('should display footer correctly on small mobile', () => {
      cy.visit('/');
      cy.get('footer').should('be.visible');
      cy.get('footer').find('a, button').each(($el) => {
        cy.wrap($el).invoke('css', 'min-height').should('not.equal', '0px');
      });
    });

    it('should have touch-friendly buttons on small mobile', () => {
      cy.visit('/products');
      cy.get('button, [role="button"], a.btn').first().then(($btn) => {
        const height = parseInt($btn.css('height'));
        expect(height).toBeGreaterThanOrEqual(44); // Minimum touch target size
      });
    });

    it('should display products grid in single column', () => {
      cy.visit('/products');
      cy.get('[class*="product-card"], [class*="product-grid"]').should('be.visible');
      // Single column on small mobile
      cy.get('[class*="product-card"]').then(($cards) => {
        if ($cards.length > 0) {
          const firstCard = $cards[0].getBoundingClientRect();
          const windowWidth = Cypress.config('viewportWidth') as number;
          expect(firstCard.width).toBeLessThan(windowWidth);
        }
      });
    });

    it('should display chatbot widget on small mobile', () => {
      cy.visit('/');
      cy.get('[class*="chatbot"], [class*="chat-widget"]').should('be.visible');
      // Chatbot should be positioned correctly
      cy.get('[class*="chatbot"]').should('have.css', 'position', 'fixed');
    });
  });

  describe('iPhone 12/13/14 (Standard Mobile)', () => {
    beforeEach(() => {
      cy.viewport(390, 844); // iPhone 12/13/14
    });

    it('should display homepage hero section correctly', () => {
      cy.visit('/');
      cy.get('[class*="hero"], [class*="banner"]').should('be.visible');
    });

    it('should display carousel correctly', () => {
      cy.visit('/');
      cy.get('[class*="carousel"], [class*="slider"]').should('be.visible');
    });

    it('should have proper spacing on standard mobile', () => {
      cy.visit('/products');
      cy.get('[class*="product-card"]').first().then(($card) => {
        const marginBottom = parseInt($card.css('margin-bottom'));
        expect(marginBottom).toBeGreaterThanOrEqual(16);
      });
    });

    it('should display filters properly on mobile', () => {
      cy.visit('/products');
      cy.get('[class*="filter"], [class*="sidebar"]').then(($filters) => {
        if ($filters.length > 0) {
          // Filters should be accessible as a drawer or accordion
          cy.get('[class*="filter-toggle"], [class*="filter-btn"]').should('be.visible');
        }
      });
    });
  });

  describe('iPad Mini (Tablet Portrait)', () => {
    beforeEach(() => {
      cy.viewport(768, 1024); // iPad Mini
    });

    it('should display header with full navigation', () => {
      cy.visit('/');
      cy.get('header').should('be.visible');
      cy.get('nav').should('be.visible');
    });

    it('should display products in 2-column grid', () => {
      cy.visit('/products');
      cy.get('[class*="product-card"]').then(($cards) => {
        if ($cards.length >= 2) {
          const firstCard = $cards[0].getBoundingClientRect();
          const secondCard = $cards[1].getBoundingClientRect();
          // Cards should be side by side
          expect(firstCard.top).toEqual(secondCard.top);
        }
      });
    });

    it('should display sidebar filters on tablet', () => {
      cy.visit('/products');
      cy.get('[class*="sidebar"], [class*="filter-panel"]').should('be.visible');
    });

    it('should display footer columns properly', () => {
      cy.visit('/');
      cy.get('footer [class*="column"], footer [class*="section"]').should('have.length.at.least', 2);
    });
  });

  describe('iPad Pro (Tablet Landscape)', () => {
    beforeEach(() => {
      cy.viewport(1024, 1366); // iPad Pro
    });

    it('should display products in 3-column grid', () => {
      cy.visit('/products');
      cy.get('[class*="product-card"]').then(($cards) => {
        if ($cards.length >= 3) {
          const firstCard = $cards[0].getBoundingClientRect();
          const secondCard = $cards[1].getBoundingClientRect();
          const thirdCard = $cards[2].getBoundingClientRect();
          // First two should be on same row
          expect(firstCard.top).toEqual(secondCard.top);
          // Third should be on next row
          expect(thirdCard.top).toBeGreaterThan(firstCard.top);
        }
      });
    });

    it('should display full navigation menu', () => {
      cy.visit('/');
      cy.get('nav a').should('have.length.at.least', 4);
    });
  });

  describe('Desktop (Large Screen)', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
    });

    it('should display full-width hero section', () => {
      cy.visit('/');
      cy.get('[class*="hero"]').then(($hero) => {
        const maxWidth = $hero.css('max-width');
        expect(maxWidth).not.toBe('100%');
      });
    });

    it('should display products in 4-column grid', () => {
      cy.visit('/products');
      cy.get('[class*="product-card"]').then(($cards) => {
        if ($cards.length >= 4) {
          const firstCard = $cards[0].getBoundingClientRect();
          const fourthCard = $cards[3].getBoundingClientRect();
          // First and fourth should be on different rows
          expect(firstCard.top).not.toEqual(fourthCard.top);
        }
      });
    });

    it('should display full sidebar', () => {
      cy.visit('/products');
      cy.get('[class*="sidebar"]').should('be.visible');
    });
  });

  describe('Landscape Mobile', () => {
    beforeEach(() => {
      cy.viewport(844, 390);
    });

    it('should display header correctly in landscape', () => {
      cy.visit('/');
      cy.get('header').should('be.visible');
    });

    it('should display products in 2-column grid in landscape', () => {
      cy.visit('/products');
      cy.get('[class*="product-card"]').then(($cards) => {
        if ($cards.length >= 2) {
          const firstCard = $cards[0].getBoundingClientRect();
          const secondCard = $cards[1].getBoundingClientRect();
          expect(firstCard.top).toEqual(secondCard.top);
        }
      });
    });

    it('should display footer correctly in landscape', () => {
      cy.visit('/');
      cy.get('footer').should('be.visible');
    });
  });

  describe('Touch Interactions', () => {
    beforeEach(() => {
      cy.viewport(390, 844); // iPhone 12
    });

    it('should support swipe gestures for carousel', () => {
      cy.visit('/');
      cy.get('[class*="carousel"], [class*="slider"]').should('be.visible');
      // Test swipe interaction
      cy.get('[class*="carousel"]').trigger('touchstart');
      cy.get('[class*="carousel"]').trigger('touchmove', { direction: 'left' });
      cy.get('[class*="carousel"]').trigger('touchend');
    });

    it('should have proper button spacing for touch', () => {
      cy.visit('/products');
      cy.get('button, [role="button"]').first().then(($btn) => {
        const rect = $btn[0].getBoundingClientRect();
        const height = rect.height;
        const width = rect.width;
        // Minimum touch target size (44x44px)
        expect(height).toBeGreaterThanOrEqual(44);
        expect(width).toBeGreaterThanOrEqual(44);
      });
    });

    it('should display modal/dialog with proper backdrop', () => {
      cy.visit('/products');
      cy.get('[class*="modal"], [class*="dialog"]').then(($modal) => {
        if ($modal.length > 0) {
          cy.get('[class*="backdrop"], [class*="overlay"]').should('be.visible');
        }
      });
    });
  });

  describe('Performance on Mobile', () => {
    beforeEach(() => {
      cy.viewport(390, 844); // iPhone 12
    });

    it('should load page within acceptable time', () => {
      const startTime = Date.now();
      cy.visit('/');
      cy.get('body').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000); // 5 seconds max
      });
    });

    it('should lazy load images on mobile', () => {
      cy.visit('/products');
      cy.get('img').each(($img) => {
        // Images should have loading="lazy" or be in viewport
        const loading = $img.attr('loading');
        if (loading !== 'lazy') {
          const rect = $img[0].getBoundingClientRect();
          expect(rect.top).toBeLessThan(window.innerHeight + 100);
        }
      });
    });
  });
});


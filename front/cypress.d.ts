/// <reference types="cypress" />

// Extend Jest's expect for use in Cypress tests
declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBe(value: expected): R;
      toEqual(value: expected): R;
      toBeGreaterThan(value: number): R;
      toBeGreaterThanOrEqual(value: number): R;
      toBeLessThan(value: number): R;
      toBeLessThanOrEqual(value: number): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeNaN(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toContain(item: string): R;
      toHaveLength(length: number): R;
      toHaveProperty(key: string, value?: expected): R;
      not: Matchers<R, T>;
    }
  }
}

// Custom command type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom login command
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Check page meta tags
       */
      checkMetaTags(tags: { title?: string; description?: string }): Chainable<void>;

      /**
       * Mock API response
       */
      mockApi(endpoint: string, response: object, status?: number): Chainable<void>;

      /**
       * Admin login command
       */
      adminLogin(): Chainable<void>;
    }
  }
}

export {};


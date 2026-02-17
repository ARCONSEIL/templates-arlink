/// <reference types="cypress" />

describe('User Journey: Browse → Product → Cart', () => {
  beforeEach(() => {
    // Mock product data
    cy.intercept('GET', '**/api/products**', {
      statusCode: 200,
      body: [
        {
          id: 'prod-1',
          productName: 'Test Product 1',
          title: 'Test Product 1',
          basePrice: 29.99,
          isOnSale: false,
          images: [{ id: '1', url: '', altText: 'Test', isPrimary: true }],
          artisan: { id: 'art-1', organization: 'Test Artisan' },
        },
      ],
    }).as('getProducts');

    // Mock single product
    cy.intercept('GET', '**/api/products/prod-1**', {
      statusCode: 200,
      body: {
        id: 'prod-1',
        productName: 'Test Product 1',
        title: 'Test Product 1',
        description: 'A test product description',
        basePrice: 29.99,
        isOnSale: false,
        images: [{ id: '1', url: '', altText: 'Test', isPrimary: true }],
        artisan: { id: 'art-1', organization: 'Test Artisan' },
        category: { id: 'cat-1', name: 'Test Category' },
      },
    }).as('getProduct');

    // Mock cart endpoint
    cy.intercept('POST', '**/api/cart/items**', {
      statusCode: 200,
      body: {
        id: 'cart-1',
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        itemCount: 1,
      },
    }).as('addToCart');
  });

  it('should browse products and add to cart', () => {
    // Step 1: Browse products
    cy.visit('/products');
    cy.wait('@getProducts');
    cy.get('[class*="product"]').first().click();

    // Step 2: View product details
    cy.wait('@getProduct');
    cy.contains('Test Product 1').should('be.visible');

    // Step 3: Add to cart (requires login)
    cy.get('[data-cy="add-to-cart-button"]').click();

    // Should redirect to login
    cy.url().should('include', '/login');
  });

  it('should display product with structured data', () => {
    cy.visit('/product/prod-1');
    cy.wait('@getProduct');
    
    // Check JSON-LD is present
    cy.get('script[type="application/ld+json"]').should('exist');
  });
});

describe('User Journey: Register → Login → Dashboard', () => {
  beforeEach(() => {
    // Mock registration
    cy.intercept('POST', '**/api/auth/register**', {
      statusCode: 201,
      body: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          userRole: 'client',
        },
        token: 'test-token',
      },
    }).as('register');

    // Mock login
    cy.intercept('POST', '**/api/auth/login**', {
      statusCode: 200,
      body: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          userRole: 'client',
        },
        token: 'test-token',
      },
    }).as('login');
  });

  it('should register new user', () => {
    cy.visit('/login');
    
    // Fill registration form
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="register-button"]').click();
    
    cy.wait('@register');
  });

  it('should login existing user', () => {
    cy.visit('/login');
    
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();
    
    cy.wait('@login');
    cy.url().should('include', '/dashboard');
  });
});

describe('User Journey: Checkout Flow', () => {
  beforeEach(() => {
    // Mock cart
    cy.intercept('GET', '**/api/cart**', {
      statusCode: 200,
      body: {
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            productName: 'Test Product',
            price: 29.99,
            quantity: 1,
            totalPrice: 29.99,
            image: null,
            variantId: null,
            attributes: null,
            shopId: null,
            shopName: null,
            tenantId: null,
          },
        ],
        subtotal: 29.99,
        tax: 2.40,
        shipping: 5.00,
        total: 37.39,
        itemCount: 1,
        couponCode: null,
      },
    }).as('getCart');

    // Mock order creation
    cy.intercept('POST', '**/api/orders**', {
      statusCode: 201,
      body: {
        id: 'order-1',
        status: 'pending',
        total: 37.39,
      },
    }).as('createOrder');
  });

  it('should complete checkout flow', () => {
    // Login first (mocked)
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'test-token');
    });

    // Visit cart
    cy.visit('/cart');
    cy.wait('@getCart');

    // Proceed to checkout
    cy.get('[data-cy="checkout-button"]').click();
    cy.url().should('include', '/checkout');

    // Step 1: Shipping (mocked)
    cy.get('[data-cy="shipping-form"]').should('be.visible');
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="address-input"]').type('123 Test St');
    cy.get('[data-cy="city-input"]').type('Paris');
    cy.get('[data-cy="continue-button"]').click();

    // Step 2: Payment (mocked)
    cy.get('[data-cy="payment-form"]').should('be.visible');
    cy.get('[data-cy="card-number-input"]').type('4242424242424242');
    cy.get('[data-cy="continue-button"]').click();

    // Step 3: Review (mocked)
    cy.get('[data-cy="review-order"]').should('be.visible');
    cy.get('[data-cy="place-order-button"]').click();

    // Should create order
    cy.wait('@createOrder');
    cy.url().should('include', '/orders');
  });
});

describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Mock admin login
    cy.intercept('POST', '**/api/auth/login**', {
      statusCode: 200,
      body: {
        user: {
          id: 'admin-1',
          email: 'admin@arlink.online',
          userRole: 'admin',
        },
        token: 'admin-token',
      },
    }).as('adminLogin');

    // Mock dashboard stats
    cy.intercept('GET', '**/api/admin/dashboard/stats**', {
      statusCode: 200,
      body: {
        users: { total: 100, artisans: 50, clients: 48, admins: 2 },
        shops: { total: 50, pending: 5, active: 43, suspended: 2 },
        products: { total: 200, active: 180, outOfStock: 20 },
        orders: { total: 150, pending: 10, completed: 130, revenue: 5000 },
        revenue: { total: 5000, thisMonth: 1000, lastMonth: 800 },
      },
    }).as('getStats');
  });

  it('should access admin dashboard with admin role', () => {
    // Login as admin
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'admin-token');
    });

    cy.visit('/admin');
    cy.wait('@getStats');
    
    cy.contains('Tableau de bord').should('be.visible');
    cy.contains('Utilisateurs').should('be.visible');
    cy.contains('Boutiques').should('be.visible');
  });
});


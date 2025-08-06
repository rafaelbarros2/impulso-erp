describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.deleteAllTestData();
  });

  describe('Login Page', () => {
    it('should display login form', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=login-form]').should('be.visible');
      cy.get('[data-cy=email-input]').should('be.visible');
      cy.get('[data-cy=password-input]').should('be.visible');
      cy.get('[data-cy=login-button]').should('be.visible');
      
      // Check for branding
      cy.contains('Impulso ERP').should('be.visible');
      cy.contains('Faça login em sua conta').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/login');
      
      // Try to submit without filling fields
      cy.get('[data-cy=login-button]').click();
      
      // Should show validation errors
      cy.contains('Email é obrigatório').should('be.visible');
      cy.contains('Senha é obrigatória').should('be.visible');
    });

    it('should show validation error for invalid email format', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type('invalid-email');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=login-button]').click();
      
      cy.contains('Email deve ter um formato válido').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type('invalid@example.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      cy.get('[data-cy=login-button]').click();
      
      // Should show error message
      cy.get('.p-toast-message-error').should('be.visible');
      cy.contains('Erro no login').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
      // This test assumes you have a test user in your system
      // You might need to create one first or use a seeded test database
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=login-button]').click();
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      
      // Should show success message
      cy.get('.p-toast-message-success').should('be.visible');
      cy.contains('Login realizado com sucesso').should('be.visible');
      
      // Should show user info in top bar
      cy.get('[data-cy=user-menu]').should('be.visible');
    });

    it('should redirect to dashboard if already logged in', () => {
      // Login first
      cy.login('test@example.com', 'password123');
      
      // Try to visit login page
      cy.visit('/login');
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
    });

    it('should logout successfully', () => {
      // Click user menu
      cy.get('[data-cy=user-menu-button]').click();
      
      // Click logout
      cy.get('[data-cy=logout-button]').click();
      
      // Should redirect to login page
      cy.url().should('include', '/login');
      
      // Should clear user session
      cy.get('[data-cy=user-menu]').should('not.exist');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without authentication', () => {
      cy.visit('/dashboard');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should allow access to protected routes when authenticated', () => {
      cy.login('test@example.com', 'password123');
      
      // Should be able to access dashboard
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
      
      // Should be able to access other protected routes
      cy.visit('/clients');
      cy.url().should('include', '/clients');
      
      cy.visit('/stock');
      cy.url().should('include', '/stock');
    });
  });
});
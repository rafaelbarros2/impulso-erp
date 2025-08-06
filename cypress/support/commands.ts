/// <reference types="cypress" />

// Custom commands for E2E testing

/**
 * Login command that handles the full login flow
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  
  // Wait for login form to be visible
  cy.get('[data-cy=login-form]').should('be.visible');
  
  // Fill in credentials
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  
  // Submit form
  cy.get('[data-cy=login-button]').click();
  
  // Wait for successful login (redirect to dashboard)
  cy.url().should('include', '/dashboard');
  
  // Verify user is logged in by checking for user menu
  cy.get('[data-cy=user-menu]').should('be.visible');
});

/**
 * Create a test user via API
 */
Cypress.Commands.add('createUser', (userData: any) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users/register`,
    body: userData,
    failOnStatusCode: false
  });
});

/**
 * Clean up test data
 */
Cypress.Commands.add('deleteAllTestData', () => {
  // This would typically call API endpoints to clean up test data
  // For now, we'll just clear local storage and cookies
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Prevent Cypress from failing on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Add data attributes helper
Cypress.Commands.add('getByCy', (selector: string) => {
  return cy.get(`[data-cy=${selector}]`);
});

declare global {
  namespace Cypress {
    interface Chainable {
      getByCy(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}
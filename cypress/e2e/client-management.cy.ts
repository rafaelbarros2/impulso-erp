describe('Client Management', () => {
  beforeEach(() => {
    cy.deleteAllTestData();
    cy.login('test@example.com', 'password123');
  });

  describe('Client List Page', () => {
    it('should display client list page', () => {
      cy.visit('/clients');
      
      // Check page elements
      cy.contains('Clientes').should('be.visible');
      cy.get('[data-cy=add-client-button]').should('be.visible');
      cy.get('[data-cy=client-search]').should('be.visible');
      cy.get('[data-cy=client-table]').should('be.visible');
    });

    it('should show empty state when no clients exist', () => {
      cy.visit('/clients');
      
      // Should show empty message or no data indicator
      cy.get('[data-cy=client-table]').should('be.visible');
      // This depends on your PrimeNG table configuration
    });

    it('should search clients', () => {
      cy.visit('/clients');
      
      // Type in search box
      cy.get('[data-cy=client-search]').type('Maria');
      
      // Should filter results
      cy.get('[data-cy=client-table]').should('be.visible');
      // Results should be filtered (depends on your implementation)
    });
  });

  describe('Add New Client', () => {
    it('should open client form when clicking add button', () => {
      cy.visit('/clients');
      
      cy.get('[data-cy=add-client-button]').click();
      
      // Should navigate to client form or open modal
      cy.url().should('include', '/clients/new');
      // OR if it's a modal:
      // cy.get('[data-cy=client-form-modal]').should('be.visible');
    });

    it('should create new client successfully', () => {
      cy.visit('/clients/new');
      
      // Fill in client form
      cy.get('[data-cy=client-name-input]').type('João Silva');
      cy.get('[data-cy=client-email-input]').type('joao.silva@example.com');
      cy.get('[data-cy=client-phone-input]').type('(11) 99999-9999');
      cy.get('[data-cy=client-cpf-input]').type('123.456.789-00');
      cy.get('[data-cy=client-address-input]').type('Rua das Flores, 123');
      
      // Submit form
      cy.get('[data-cy=save-client-button]').click();
      
      // Should show success message
      cy.get('.p-toast-message-success').should('be.visible');
      cy.contains('Cliente criado com sucesso').should('be.visible');
      
      // Should redirect to client list
      cy.url().should('include', '/clients');
      
      // Should show new client in list
      cy.contains('João Silva').should('be.visible');
    });

    it('should show validation errors for empty required fields', () => {
      cy.visit('/clients/new');
      
      // Try to submit without filling required fields
      cy.get('[data-cy=save-client-button]').click();
      
      // Should show validation errors
      cy.contains('Nome é obrigatório').should('be.visible');
      // Add other required field validations as per your form
    });

    it('should validate email format', () => {
      cy.visit('/clients/new');
      
      cy.get('[data-cy=client-name-input]').type('Test User');
      cy.get('[data-cy=client-email-input]').type('invalid-email');
      
      cy.get('[data-cy=save-client-button]').click();
      
      cy.contains('Email deve ter um formato válido').should('be.visible');
    });

    it('should validate CPF format', () => {
      cy.visit('/clients/new');
      
      cy.get('[data-cy=client-name-input]').type('Test User');
      cy.get('[data-cy=client-cpf-input]').type('invalid-cpf');
      
      cy.get('[data-cy=save-client-button]').click();
      
      // Should show CPF validation error (depends on your validation)
      cy.contains('CPF inválido').should('be.visible');
    });
  });

  describe('Edit Client', () => {
    beforeEach(() => {
      // Create a test client first
      cy.visit('/clients/new');
      cy.get('[data-cy=client-name-input]').type('Test Client');
      cy.get('[data-cy=client-email-input]').type('test.client@example.com');
      cy.get('[data-cy=client-phone-input]').type('(11) 98765-4321');
      cy.get('[data-cy=save-client-button]').click();
      cy.url().should('include', '/clients');
    });

    it('should open edit form when clicking edit button', () => {
      cy.visit('/clients');
      
      // Click edit button on first client
      cy.get('[data-cy=edit-client-button]').first().click();
      
      // Should navigate to edit form
      cy.url().should('include', '/clients/edit');
      
      // Form should be pre-filled
      cy.get('[data-cy=client-name-input]').should('have.value', 'Test Client');
    });

    it('should update client successfully', () => {
      cy.visit('/clients');
      cy.get('[data-cy=edit-client-button]').first().click();
      
      // Update name
      cy.get('[data-cy=client-name-input]').clear().type('Updated Client Name');
      
      // Save changes
      cy.get('[data-cy=save-client-button]').click();
      
      // Should show success message
      cy.get('.p-toast-message-success').should('be.visible');
      
      // Should show updated name in list
      cy.url().should('include', '/clients');
      cy.contains('Updated Client Name').should('be.visible');
    });
  });

  describe('Delete Client', () => {
    beforeEach(() => {
      // Create a test client first
      cy.visit('/clients/new');
      cy.get('[data-cy=client-name-input]').type('Client to Delete');
      cy.get('[data-cy=client-email-input]').type('delete.me@example.com');
      cy.get('[data-cy=save-client-button]').click();
      cy.url().should('include', '/clients');
    });

    it('should delete client successfully', () => {
      cy.visit('/clients');
      
      // Click delete button
      cy.get('[data-cy=delete-client-button]').first().click();
      
      // Should show confirmation dialog
      cy.get('[data-cy=confirm-delete-dialog]').should('be.visible');
      cy.contains('Tem certeza que deseja excluir').should('be.visible');
      
      // Confirm deletion
      cy.get('[data-cy=confirm-delete-button]').click();
      
      // Should show success message
      cy.get('.p-toast-message-success').should('be.visible');
      cy.contains('Cliente excluído com sucesso').should('be.visible');
      
      // Client should be removed from list
      cy.contains('Client to Delete').should('not.exist');
    });

    it('should cancel deletion when clicking cancel', () => {
      cy.visit('/clients');
      
      cy.get('[data-cy=delete-client-button]').first().click();
      cy.get('[data-cy=confirm-delete-dialog]').should('be.visible');
      
      // Cancel deletion
      cy.get('[data-cy=cancel-delete-button]').click();
      
      // Dialog should close
      cy.get('[data-cy=confirm-delete-dialog]').should('not.exist');
      
      // Client should still exist
      cy.contains('Client to Delete').should('be.visible');
    });
  });

  describe('Client Search and Filter', () => {
    beforeEach(() => {
      // Create multiple test clients
      const clients = [
        { name: 'Ana Silva', email: 'ana@example.com' },
        { name: 'Bruno Santos', email: 'bruno@example.com' },
        { name: 'Carlos Lima', email: 'carlos@example.com' }
      ];

      clients.forEach(client => {
        cy.visit('/clients/new');
        cy.get('[data-cy=client-name-input]').type(client.name);
        cy.get('[data-cy=client-email-input]').type(client.email);
        cy.get('[data-cy=save-client-button]').click();
        cy.url().should('include', '/clients');
      });
    });

    it('should filter clients by name', () => {
      cy.visit('/clients');
      
      // Search for "Ana"
      cy.get('[data-cy=client-search]').type('Ana');
      
      // Should show only Ana Silva
      cy.contains('Ana Silva').should('be.visible');
      cy.contains('Bruno Santos').should('not.exist');
      cy.contains('Carlos Lima').should('not.exist');
    });

    it('should show all clients when search is cleared', () => {
      cy.visit('/clients');
      
      // Search first
      cy.get('[data-cy=client-search]').type('Ana');
      cy.contains('Ana Silva').should('be.visible');
      
      // Clear search
      cy.get('[data-cy=client-search]').clear();
      
      // Should show all clients
      cy.contains('Ana Silva').should('be.visible');
      cy.contains('Bruno Santos').should('be.visible');
      cy.contains('Carlos Lima').should('be.visible');
    });
  });
});
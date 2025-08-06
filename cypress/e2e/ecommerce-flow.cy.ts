describe('E-commerce Flow', () => {
  beforeEach(() => {
    cy.deleteAllTestData();
    cy.login('test@example.com', 'password123');
  });

  describe('Product to Cart to Checkout Flow', () => {
    beforeEach(() => {
      // Setup: Create a test product first
      cy.visit('/stock/products/new');
      cy.get('[data-cy=product-name-input]').type('Test Product');
      cy.get('[data-cy=product-sku-input]').type('TEST-001');
      cy.get('[data-cy=product-price-input]').type('29.99');
      cy.get('[data-cy=product-description-input]').type('This is a test product for E2E testing');
      cy.get('[data-cy=save-product-button]').click();
      
      // Navigate to storefront
      cy.visit('/ecommerce/storefront');
    });

    it('should complete the full purchase journey: browse → add to cart → checkout', () => {
      // Step 1: Browse products on storefront
      cy.get('[data-cy=storefront-products]').should('be.visible');
      cy.contains('Test Product').should('be.visible');
      
      // Step 2: Add product to cart
      cy.get('[data-cy=add-to-cart-button]').first().click();
      
      // Should show success message
      cy.get('.p-toast-message-success').should('be.visible');
      cy.contains('Produto adicionado ao carrinho').should('be.visible');
      
      // Cart counter should update
      cy.get('[data-cy=cart-counter]').should('contain', '1');
      
      // Step 3: View cart
      cy.get('[data-cy=cart-button]').click();
      cy.url().should('include', '/cart');
      
      // Verify product is in cart
      cy.contains('Test Product').should('be.visible');
      cy.contains('R$ 29,99').should('be.visible');
      
      // Step 4: Proceed to checkout
      cy.get('[data-cy=checkout-button]').click();
      cy.url().should('include', '/checkout');
      
      // Step 5: Fill checkout form
      cy.get('[data-cy=client-name-input]').type('João da Silva');
      cy.get('[data-cy=client-email-input]').type('joao@example.com');
      cy.get('[data-cy=client-phone-input]').type('(11) 99999-9999');
      cy.get('[data-cy=delivery-address-input]').type('Rua das Flores, 123, São Paulo - SP');
      
      // Select payment method
      cy.get('[data-cy=payment-method-pix]').click();
      
      // Step 6: Complete order
      cy.get('[data-cy=complete-order-button]').click();
      
      // Should show success page or message
      cy.get('.p-toast-message-success').should('be.visible');
      cy.contains('Pedido realizado com sucesso').should('be.visible');
      
      // Should redirect to success page or clear cart
      cy.get('[data-cy=cart-counter]').should('contain', '0');
    });

    it('should allow quantity updates in cart', () => {
      // Add product to cart
      cy.get('[data-cy=add-to-cart-button]').first().click();
      
      // Go to cart
      cy.get('[data-cy=cart-button]').click();
      
      // Verify initial quantity
      cy.get('[data-cy=quantity-input]').should('have.value', '1');
      
      // Increase quantity
      cy.get('[data-cy=increase-quantity-button]').click();
      cy.get('[data-cy=quantity-input]').should('have.value', '2');
      
      // Verify total price updated
      cy.contains('R$ 59,98').should('be.visible'); // 2 * 29.99
      
      // Decrease quantity
      cy.get('[data-cy=decrease-quantity-button]').click();
      cy.get('[data-cy=quantity-input]').should('have.value', '1');
      cy.contains('R$ 29,99').should('be.visible');
    });

    it('should allow product removal from cart', () => {
      // Add product to cart
      cy.get('[data-cy=add-to-cart-button]').first().click();
      
      // Go to cart
      cy.get('[data-cy=cart-button]').click();
      
      // Remove product
      cy.get('[data-cy=remove-item-button]').click();
      
      // Should show confirmation
      cy.get('[data-cy=confirm-remove-dialog]').should('be.visible');
      cy.get('[data-cy=confirm-remove-button]').click();
      
      // Cart should be empty
      cy.contains('Seu carrinho está vazio').should('be.visible');
      cy.get('[data-cy=cart-counter]').should('contain', '0');
    });

    it('should handle out of stock products', () => {
      // This test would require setting up a product with no stock
      // or mocking the stock service response
      
      // Try to add out of stock product
      cy.get('[data-cy=out-of-stock-product]').should('be.visible');
      cy.get('[data-cy=add-to-cart-button]').should('be.disabled');
      cy.contains('Fora de estoque').should('be.visible');
    });
  });

  describe('WhatsApp Checkout Flow', () => {
    beforeEach(() => {
      // Add product to cart first
      cy.visit('/ecommerce/storefront');
      cy.get('[data-cy=add-to-cart-button]').first().click();
      cy.get('[data-cy=cart-button]').click();
    });

    it('should redirect to WhatsApp checkout', () => {
      // Click WhatsApp checkout button
      cy.get('[data-cy=whatsapp-checkout-button]').click();
      
      cy.url().should('include', '/checkout/whatsapp');
      
      // Fill basic info
      cy.get('[data-cy=client-name-input]').type('Maria Santos');
      cy.get('[data-cy=client-phone-input]').type('(11) 98765-4321');
      
      // Generate WhatsApp message
      cy.get('[data-cy=generate-whatsapp-button]').click();
      
      // Should show WhatsApp message preview
      cy.get('[data-cy=whatsapp-message-preview]').should('be.visible');
      cy.contains('Olá! Gostaria de fazer o seguinte pedido:').should('be.visible');
      cy.contains('Test Product').should('be.visible');
      
      // Click to open WhatsApp (this would open external app)
      cy.get('[data-cy=open-whatsapp-button]').should('be.visible');
    });
  });

  describe('Product Search and Filtering', () => {
    beforeEach(() => {
      // Create multiple products with different categories
      const products = [
        { name: 'Camiseta Azul', category: 'Roupas', price: '39.99' },
        { name: 'Calça Jeans', category: 'Roupas', price: '89.99' },
        { name: 'Tênis Esportivo', category: 'Calçados', price: '199.99' }
      ];

      products.forEach(product => {
        cy.visit('/stock/products/new');
        cy.get('[data-cy=product-name-input]').type(product.name);
        cy.get('[data-cy=product-category-input]').type(product.category);
        cy.get('[data-cy=product-price-input]').type(product.price);
        cy.get('[data-cy=save-product-button]').click();
      });

      cy.visit('/ecommerce/storefront');
    });

    it('should filter products by category', () => {
      // Click on category filter
      cy.get('[data-cy=category-filter-roupas]').click();
      
      // Should show only clothing items
      cy.contains('Camiseta Azul').should('be.visible');
      cy.contains('Calça Jeans').should('be.visible');
      cy.contains('Tênis Esportivo').should('not.exist');
    });

    it('should search products by name', () => {
      // Use search box
      cy.get('[data-cy=product-search-input]').type('Camiseta');
      
      // Should show only matching products
      cy.contains('Camiseta Azul').should('be.visible');
      cy.contains('Calça Jeans').should('not.exist');
      cy.contains('Tênis Esportivo').should('not.exist');
    });

    it('should filter by price range', () => {
      // Set price range filter
      cy.get('[data-cy=price-filter-min]').type('50');
      cy.get('[data-cy=price-filter-max]').type('150');
      cy.get('[data-cy=apply-price-filter]').click();
      
      // Should show products in range
      cy.contains('Calça Jeans').should('be.visible'); // 89.99
      cy.contains('Camiseta Azul').should('not.exist'); // 39.99
      cy.contains('Tênis Esportivo').should('not.exist'); // 199.99
    });
  });

  describe('Cart Persistence', () => {
    it('should maintain cart contents across browser sessions', () => {
      // Add item to cart
      cy.visit('/ecommerce/storefront');
      cy.get('[data-cy=add-to-cart-button]').first().click();
      
      // Verify cart counter
      cy.get('[data-cy=cart-counter]').should('contain', '1');
      
      // Simulate browser refresh
      cy.reload();
      
      // Cart should still contain the item
      cy.get('[data-cy=cart-counter]').should('contain', '1');
      
      // Verify in cart page
      cy.get('[data-cy=cart-button]').click();
      cy.contains('Test Product').should('be.visible');
    });

    it('should clear cart after successful checkout', () => {
      // Add item and complete checkout
      cy.visit('/ecommerce/storefront');
      cy.get('[data-cy=add-to-cart-button]').first().click();
      cy.get('[data-cy=cart-button]').click();
      cy.get('[data-cy=checkout-button]').click();
      
      // Fill and submit checkout form
      cy.get('[data-cy=client-name-input]').type('Test Customer');
      cy.get('[data-cy=client-email-input]').type('customer@example.com');
      cy.get('[data-cy=client-phone-input]').type('(11) 99999-9999');
      cy.get('[data-cy=complete-order-button]').click();
      
      // Cart should be empty
      cy.get('[data-cy=cart-counter]').should('contain', '0');
    });
  });
});
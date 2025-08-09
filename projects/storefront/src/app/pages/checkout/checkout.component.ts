import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="checkout-container">
      <div class="checkout-header">
        <h1 class="checkout-title">Finalizar Compra</h1>
        <p class="checkout-subtitle">Revise seus dados e finalize seu pedido</p>
      </div>

      <div class="checkout-content">
        <div class="checkout-steps">
          <div class="step active">
            <div class="step-number">1</div>
            <span>Dados pessoais</span>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <span>Endereço</span>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <span>Pagamento</span>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <span>Confirmação</span>
          </div>
        </div>

        <div class="checkout-main">
          <div class="coming-soon">
            <i class="pi pi-clock text-6xl text-gray-400 mb-4"></i>
            <h2 class="text-2xl font-semibold text-gray-700 mb-2">Checkout em desenvolvimento</h2>
            <p class="text-gray-500 mb-6">Esta funcionalidade estará disponível em breve.</p>
            
            <p-button 
              label="Voltar ao Carrinho" 
              icon="pi pi-arrow-left" 
              (onClick)="goBackToCart()"
              styleClass="p-button-outlined">
            </p-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
    }

    .checkout-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .checkout-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .checkout-subtitle {
      color: var(--text-color-secondary);
      font-size: 1.1rem;
    }

    .checkout-steps {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 3rem;
      gap: 2rem;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-color-secondary);
    }

    .step.active {
      color: var(--primary-color);
      font-weight: 600;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--surface-200);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .step.active .step-number {
      background: var(--primary-color);
      color: white;
    }

    .checkout-main {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .coming-soon {
      text-align: center;
      background: white;
      padding: 4rem 3rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    @media (max-width: 768px) {
      .checkout-steps {
        flex-direction: column;
        gap: 1rem;
      }
      
      .coming-soon {
        padding: 3rem 2rem;
      }
    }
  `]
})
export class CheckoutComponent {
  constructor(private router: Router) {}

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
}
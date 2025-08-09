import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface ShippingOption {
  type: string;
  price: number;
  days: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService, CurrencyPipe],
  template: `
    <p-toast position="top-right"></p-toast>
    <div class="cart-container">
      <div class="cart-header">
        <h1 class="cart-title">Meu Carrinho</h1>
        <p class="cart-subtitle">Revise seus itens antes de finalizar a compra</p>
      </div>

      <div class="cart-content-desktop">
        <!-- Left Column: Cart Items -->
        <div class="cart-items-list" *ngIf="cartData.length > 0">
          <div class="cart-item fade-in" *ngFor="let item of cartData; let i = index">
            <!-- Layout para desktop -->
            <img [src]="item.image" [alt]="item.name" class="item-image hidden md:block">
            <div class="item-info">
              <p class="item-name">{{ item.name }}</p>
              <p class="item-price">{{ item.price | currency:'BRL':'symbol':'1.2-2':'pt' }}</p>
              <p class="item-stock">
                <i class="pi pi-check-circle text-green-500 mr-1"></i>
                {{ item.stock }} em estoque
              </p>
            </div>
            <div class="item-actions hidden md:flex">
              <div class="qty-controls">
                <button class="qty-button" (click)="updateQuantity(i, item.quantity - 1)" [disabled]="item.quantity <= 1">
                  <i class="pi pi-minus"></i>
                </button>
                <span class="qty-display">{{ item.quantity }}</span>
                <button class="qty-button" (click)="updateQuantity(i, item.quantity + 1)" [disabled]="item.quantity >= item.stock">
                  <i class="pi pi-plus"></i>
                </button>
              </div>
              <div class="action-buttons">
                <button class="save-later-btn" (click)="saveForLater(item)">
                  <i class="pi pi-heart"></i>
                </button>
                <button class="remove-button" (click)="removeItem(i)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>

            <!-- Layout específico para mobile -->
            <div class="mobile-item-top flex md:hidden">
              <img [src]="item.image" [alt]="item.name" class="item-image">
              <div class="mobile-controls">
                <div class="qty-controls">
                  <button class="qty-button" (click)="updateQuantity(i, item.quantity - 1)" [disabled]="item.quantity <= 1">
                    <i class="pi pi-minus"></i>
                  </button>
                  <span class="qty-display">{{ item.quantity }}</span>
                  <button class="qty-button" (click)="updateQuantity(i, item.quantity + 1)" [disabled]="item.quantity >= item.stock">
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
                <div class="action-buttons">
                  <button class="save-later-btn" (click)="saveForLater(item)">
                    <i class="pi pi-heart"></i>
                  </button>
                  <button class="remove-button" (click)="removeItem(i)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <!-- Informações do item para mobile -->
            <div class="item-info-mobile md:hidden">
                <p class="item-name">{{ item.name }}</p>
                <p class="item-price">{{ item.price | currency:'BRL':'symbol':'1.2-2':'pt' }}</p>
                <p class="item-stock">
                    <i class="pi pi-check-circle text-green-500 mr-1"></i>
                    {{ item.stock }} em estoque
                </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Summary -->
        <div class="cart-summary" *ngIf="cartData.length > 0">
          <h3 class="summary-title">Resumo do Pedido</h3>
          
          <div class="summary-row">
            <span class="text-gray-600">Subtotal:</span>
            <span class="font-semibold text-gray-800">{{ subtotal | currency:'BRL':'symbol':'1.2-2':'pt' }}</span>
          </div>
          
          <div class="summary-row">
            <span class="text-gray-600">Desconto:</span>
            <span class="font-semibold text-green-600">-{{ discount | currency:'BRL':'symbol':'1.2-2':'pt' }}</span>
          </div>
          
          <div class="summary-row" *ngIf="shippingCalculated">
            <span class="text-gray-600">Frete:</span>
            <span class="font-semibold text-gray-800" [ngClass]="{'text-green-600': shipping === 0}">
                {{ shipping === 0 ? 'Grátis' : (shipping | currency:'BRL':'symbol':'1.2-2':'pt') }}
            </span>
          </div>
          
          <div class="shipping-info">
            <i class="pi pi-truck text-blue-600"></i>
            <p class="text-sm text-gray-700 mt-2">
              <ng-container *ngIf="subtotal < freeShippingThreshold">
                <strong>Frete Grátis</strong> para compras acima de {{ freeShippingThreshold | currency:'BRL':'symbol':'1.2-2':'pt' }}<br>
                <span class="text-yellow-600 text-xs">Faltam apenas {{ (freeShippingThreshold - subtotal) | currency:'BRL':'symbol':'1.2-2':'pt' }} para o frete grátis!</span>
              </ng-container>
              <ng-container *ngIf="subtotal >= freeShippingThreshold">
                <strong class="text-green-600">🎉 Parabéns!</strong> Você ganhou frete grátis!
              </ng-container>
            </p>
          </div>
          
          <div class="discount-section">
            <input type="text" pInputText id="discount-code" class="discount-input" placeholder="Código de desconto" [(ngModel)]="discountCode" [disabled]="discountApplied">
            <button class="apply-discount-btn" (click)="applyDiscount()" [disabled]="discountApplied">
              <i class="pi pi-tag mr-2"></i>
              {{ discountApplied ? 'Desconto Aplicado' : 'Aplicar Desconto' }}
            </button>
          </div>
          
          <div class="cep-section">
            <label class="cep-label">Calcular Frete e Prazo</label>
            <div class="cep-input-group">
              <input type="text" pInputText id="cep-input" class="cep-input" placeholder="00000-000" [(ngModel)]="cep" [disabled]="isCalculatingShipping">
              <button class="calculate-shipping-btn" (click)="calculateShipping()" [disabled]="isCalculatingShipping">
                <i class="pi pi-map-marker mr-1" [ngClass]="{'pi-spin pi-spinner': isCalculatingShipping}"></i>
                {{ isCalculatingShipping ? 'Calculando...' : 'Calcular' }}
              </button>
            </div>
            <div class="shipping-results" *ngIf="shippingOptions.length > 0">
              <div 
                *ngFor="let option of shippingOptions"
                class="shipping-option"
                [ngClass]="{'selected': option.price === shipping}"
                (click)="selectShipping(option.price)"
              >
                <div class="shipping-info-line">
                  <span class="shipping-type">{{ option.type }}</span>
                  <span class="shipping-price" [ngClass]="{'text-green-600': option.price === 0}">
                    {{ option.price === 0 ? 'Grátis' : (option.price | currency:'BRL':'symbol':'1.2-2':'pt') }}
                  </span>
                </div>
                <span class="shipping-time">Receba em {{ option.days }}</span>
              </div>
            </div>
          </div>
          
          <div class="summary-row total">
            <span class="text-xl font-bold text-gray-800">Total:</span>
            <div>
              <span class="text-2xl font-bold text-green-600">{{ total | currency:'BRL':'symbol':'1.2-2':'pt' }}</span>
              <span class="savings-badge" *ngIf="discount > 0">
                Você economiza {{ discount | currency:'BRL':'symbol':'1.2-2':'pt' }}
              </span>
            </div>
          </div>
          
          <button class="continue-shopping-button" (click)="continueShopping()">
            <i class="pi pi-arrow-left mr-2"></i>
            Continuar Comprando
          </button>
          
          <button class="checkout-button" (click)="proceedToCheckout()">
            <i class="pi pi-credit-card mr-2"></i>
            Finalizar Compra
          </button>
        </div>

        <!-- Empty Cart State -->
        <div class="empty-cart" *ngIf="cartData.length === 0">
          <i class="pi pi-shopping-cart text-5xl text-gray-400 mb-4"></i>
          <h2 class="text-2xl font-semibold text-gray-700 mb-2">Seu carrinho está vazio</h2>
          <p class="text-gray-500">Adicione produtos para continuar.</p>
          <button class="continue-shopping-button mt-6" (click)="continueShopping()">
            <i class="pi pi-shopping-bag mr-2"></i>
            Explorar Produtos
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
    }

    .cart-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .cart-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .cart-subtitle {
      color: var(--text-color-secondary);
      font-size: 1.1rem;
    }

    .cart-content-desktop {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 3rem;
    }

    @media (max-width: 1024px) {
      .cart-content-desktop {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      align-items: center;
    }

    @media (max-width: 768px) {
      .cart-item {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }

    .item-image {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      .mobile-item-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .item-image {
        width: 80px;
        height: 80px;
      }
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .item-name {
      font-weight: 600;
      font-size: 1.1rem;
      color: var(--text-color);
      margin: 0;
    }

    .item-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--primary-color);
      margin: 0;
    }

    .item-stock {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
      margin: 0;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .qty-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--surface-100);
      border-radius: 8px;
      padding: 0.25rem;
    }

    .qty-button {
      width: 32px;
      height: 32px;
      border: none;
      background: white;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .qty-button:hover {
      background: var(--primary-50);
      color: var(--primary-color);
    }

    .qty-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .qty-display {
      min-width: 30px;
      text-align: center;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .save-later-btn, .remove-button {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .save-later-btn {
      background: var(--pink-50);
      color: var(--pink-500);
    }

    .save-later-btn:hover {
      background: var(--pink-100);
    }

    .remove-button {
      background: var(--red-50);
      color: var(--red-500);
    }

    .remove-button:hover {
      background: var(--red-100);
    }

    .cart-summary {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .summary-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      color: var(--text-color);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
    }

    .summary-row.total {
      border-top: 2px solid var(--surface-200);
      padding-top: 1rem;
      margin-top: 1.5rem;
    }

    .shipping-info {
      background: var(--blue-50);
      padding: 1rem;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    .discount-section {
      margin: 1.5rem 0;
    }

    .discount-input {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .apply-discount-btn {
      width: 100%;
      background: var(--green-500);
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .apply-discount-btn:hover {
      background: var(--green-600);
    }

    .apply-discount-btn:disabled {
      background: var(--surface-300);
      cursor: not-allowed;
    }

    .cep-section {
      margin: 1.5rem 0;
    }

    .cep-label {
      font-weight: 600;
      color: var(--text-color);
      display: block;
      margin-bottom: 0.5rem;
    }

    .cep-input-group {
      display: flex;
      gap: 0.5rem;
    }

    .cep-input {
      flex: 1;
    }

    .calculate-shipping-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      white-space: nowrap;
    }

    .shipping-results {
      margin-top: 1rem;
    }

    .shipping-option {
      padding: 1rem;
      border: 1px solid var(--surface-300);
      border-radius: 8px;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .shipping-option:hover,
    .shipping-option.selected {
      border-color: var(--primary-color);
      background: var(--primary-50);
    }

    .shipping-info-line {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .shipping-time {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
    }

    .continue-shopping-button {
      width: 100%;
      background: var(--surface-100);
      color: var(--text-color);
      border: 1px solid var(--surface-300);
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 1rem;
      transition: all 0.2s;
    }

    .continue-shopping-button:hover {
      background: var(--surface-200);
    }

    .checkout-button {
      width: 100%;
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .checkout-button:hover {
      background: var(--primary-600);
    }

    .empty-cart {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
    }

    .savings-badge {
      display: block;
      font-size: 0.8rem;
      color: var(--green-600);
      margin-top: 0.25rem;
    }

    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CartComponent implements OnInit {
  cartData: CartItem[] = [];
  subtotal: number = 0;
  total: number = 0;
  discountCode: string = '';
  discount: number = 0;
  discountApplied: boolean = false;
  cep: string = '';
  shipping: number = 0;
  shippingCalculated: boolean = false;
  isCalculatingShipping: boolean = false;
  freeShippingThreshold: number = 199.00;
  
  // Códigos de desconto válidos
  validDiscountCodes = {
    'VERAO25': 25,
    'PRIMEIRA10': 10,
    'FRETE15': 15,
    'VIP20': 20
  };
  
  shippingOptions: ShippingOption[] = [];

  constructor(private messageService: MessageService, private currencyPipe: CurrencyPipe, private router: Router) {}

  ngOnInit(): void {
    this.loadCart();
    this.calculateTotals();
  }

  loadCart(): void {
    // Simulação de carregamento de dados do carrinho
    this.cartData = [
      {
        id: 'prod1',
        name: 'Vestido Floral Verão',
        price: 119.90,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1515372039744-b8f0a3ae446?auto=format&fit=crop&q=80&w=300&h=300',
        stock: 10
      },
      {
        id: 'prod2',
        name: 'Tênis Esportivo Casual',
        price: 189.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=300&h=300',
        stock: 5
      }
    ];
  }

  calculateTotals(): void {
    this.subtotal = this.cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const code = this.discountCode.toUpperCase() as keyof typeof this.validDiscountCodes;
    this.discount = this.subtotal * (this.discountApplied && this.validDiscountCodes[code] ? (this.validDiscountCodes[code] / 100) : 0);
    
    // Frete grátis se o subtotal for maior ou igual ao limite
    this.shipping = (this.subtotal >= this.freeShippingThreshold) ? 0 : this.shipping;
    
    this.total = this.subtotal - this.discount + this.shipping;
    if (this.total < 0) {
      this.total = 0;
    }
  }

  updateQuantity(index: number, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(index);
      return;
    }
    const item = this.cartData[index];
    if (newQuantity > item.stock) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: `Apenas ${item.stock} unidades disponíveis!` });
      return;
    }
    item.quantity = newQuantity;
    this.calculateTotals();
  }

  removeItem(index: number): void {
    const removedItem = this.cartData.splice(index, 1);
    this.calculateTotals();
    this.messageService.add({ severity: 'info', summary: 'Removido', detail: `${removedItem[0].name} foi removido do carrinho.` });
  }

  saveForLater(item: CartItem): void {
    this.messageService.add({ severity: 'info', summary: 'Salvo para depois', detail: `${item.name} foi salvo para depois.` });
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }
  
  applyDiscount(): void {
    if (!this.discountCode) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Por favor, digite um código de desconto.' });
      return;
    }

    const code = this.discountCode.toUpperCase() as keyof typeof this.validDiscountCodes;
    if (this.validDiscountCodes[code]) {
      this.discountApplied = true;
      this.calculateTotals();
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Desconto aplicado com sucesso!' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Código de desconto inválido.' });
    }
  }

  calculateShipping(): void {
    const cepDigits = this.cep.replace(/\D/g, '');
    if (cepDigits.length !== 8) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Digite um CEP válido com 8 dígitos.' });
      return;
    }

    this.isCalculatingShipping = true;
    setTimeout(() => {
      this.isCalculatingShipping = false;
      const firstDigit = parseInt(cepDigits.charAt(0));
      
      let pacPrice = 15.90;
      let sedexPrice = 25.90;
      
      if (firstDigit >= 6) {
        pacPrice = 22.90;
        sedexPrice = 35.90;
      } else if (firstDigit >= 3 && firstDigit <= 5) {
        pacPrice = 12.90;
        sedexPrice = 22.90;
      }
      
      this.shippingOptions = [
        { type: 'PAC', price: pacPrice, days: '5 a 8 dias úteis' },
        { type: 'SEDEX', price: sedexPrice, days: '2 a 3 dias úteis' }
      ];

      this.shippingCalculated = true;
      this.selectShipping(this.shippingOptions[1].price); // Seleciona SEDEX por padrão
      
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Frete calculado com sucesso!' });
    }, 2000);
  }

  selectShipping(price: number): void {
    this.shipping = price;
    this.calculateTotals();
    this.messageService.add({ severity: 'info', summary: 'Frete', detail: 'Frete selecionado com sucesso.' });
  }

  proceedToCheckout(): void {
    if (this.cartData.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Adicione itens ao carrinho primeiro!' });
      return;
    }
    // Navigate to checkout in storefront
    this.router.navigate(['/checkout']);
  }
}
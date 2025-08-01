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
  selector: 'app-cart-page',
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
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent implements OnInit {
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
    this.router.navigate(['/ecommerce/store']);
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
    // Lógica para navegar para a tela de checkout
    this.messageService.add({ severity: 'success', summary: 'Navegação', detail: 'Redirecionando para o checkout...' });
  }
}

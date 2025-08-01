import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
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

  constructor(private messageService: MessageService, private currencyPipe: CurrencyPipe) {}

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
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=300&h=300',
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
    this.total = this.subtotal;
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

  // Métodos de navegação (simulados)
  continueShopping(): void {
    this.messageService.add({ severity: 'success', summary: 'Navegação', detail: 'Redirecionando para a loja...' });
    // Lógica para navegar de volta para a loja
  }

  proceedToCheckout(): void {
    if (this.cartData.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Adicione itens ao carrinho primeiro!' });
      return;
    }
    this.messageService.add({ severity: 'success', summary: 'Navegação', detail: 'Redirecionando para o checkout...' });
    // Lógica para navegar para a tela de checkout
  }
}


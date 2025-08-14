import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PosProduct, PosCartItem, PosClient, PosPaymentMethod } from '../../../../core/models';

@Component({
  selector: 'app-pdv',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    InputIconModule,
    IconFieldModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pos-page.component.html',
  styleUrls: ['./pos-page.component.scss']
})
export class PosPageComponent implements OnInit {
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  // Data Properties
  // TODO: Implementar carregamento real de produtos da API
  // products: PosProduct[] = [
  //   {
  //     id: '001',
  //     name: 'Coca-Cola 350ml',
  //     price: 4.50,
  //     stock: 15,
  //     emoji: '🥤',
  //     categoryId: 'bebidas',
  //     barcode: '7894900011517',
  //     sku: 'COCA350'
  //   },
  //   {
  //     id: '002',
  //     name: 'Pão de Açúcar 500g',
  //     price: 6.90,
  //     stock: 8,
  //     emoji: '🍞',
  //     categoryId: 'alimentacao',
  //     barcode: '7891000055557',
  //     sku: 'PAO500'
  //   },
  //   {
  //     id: '003',
  //     name: 'Leite Integral 1L',
  //     price: 5.20,
  //     stock: 12,
  //     emoji: '🥛',
  //     categoryId: 'bebidas',
  //     barcode: '7891000100103',
  //     sku: 'LEITE1L'
  //   },
  //   {
  //     id: '004',
  //     name: 'Café Pilão 500g',
  //     price: 12.90,
  //     stock: 6,
  //     emoji: '☕',
  //     categoryId: 'alimentacao',
  //     barcode: '7896005200551',
  //     sku: 'CAFE500'
  //   },
  //   {
  //     id: '005',
  //     name: 'Arroz Tio João 5kg',
  //     price: 22.50,
  //     stock: 20,
  //     emoji: '🍚',
  //     categoryId: 'alimentacao',
  //     barcode: '7896265400024',
  //     sku: 'ARROZ5K'
  //   },
  //   {
  //     id: '006',
  //     name: 'Feijão Carioca 1kg',
  //     price: 8.90,
  //     stock: 10,
  //     emoji: '🫘',
  //     categoryId: 'alimentacao',
  //     barcode: '7891000050010',
  //     sku: 'FEIJAO1K'
  //   },
  //   {
  //     id: '007',
  //     name: 'Detergente Ypê 500ml',
  //     price: 2.90,
  //     stock: 25,
  //     emoji: '🧽',
  //     categoryId: 'limpeza',
  //     barcode: '7891040244012',
  //     sku: 'DET500'
  //   },
  //   {
  //     id: '008',
  //     name: 'Shampoo Seda 400ml',
  //     price: 15.90,
  //     stock: 7,
  //     emoji: '🧴',
  //     categoryId: 'higiene',
  //     barcode: '7891150056411',
  //     sku: 'SHAM400'
  //   }
  // ];
  products: PosProduct[] = []; // Removido dados mockados

  paymentMethods: PosPaymentMethod[] = [
    { id: 'dinheiro', name: 'Dinheiro', icon: 'pi pi-money-bill' },
    { id: 'cartao', name: 'Cartão', icon: 'pi pi-credit-card' },
    { id: 'pix', name: 'PIX', icon: 'pi pi-qrcode' },
    { id: 'fiado', name: 'Fiado', icon: 'pi pi-handshake' }
  ];

  // Component State
  cartItems: PosCartItem[] = [];
  searchInput: string = '';
  searchSuggestions: PosProduct[] = [];
  selectedPaymentId: string = 'dinheiro';
  discountPercent: number = 0;

  selectedClient: PosClient = {
    id: 'default',
    name: 'Cliente Padrão',
    cpf: '',
    phone: ''
  };

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    // Focus on search input when component loads
    setTimeout(() => {
      if (this.searchInputRef && this.searchInputRef.nativeElement) {
        this.searchInputRef.nativeElement.focus();
      }
    }, 100);
  }

  // Search and Add Methods
  onSearchInputChange(): void {
    const searchTerm = this.searchInput.trim().toLowerCase();
    
    if (searchTerm.length >= 2) {
      this.searchSuggestions = this.getSearchSuggestions(searchTerm);
    } else {
      this.searchSuggestions = [];
    }
  }

  addProductBySearch(): void {
    const searchTerm = this.searchInput.trim().toLowerCase();
    
    if (!searchTerm) {
      this.showError('Digite um código, código de barras ou nome do produto');
      return;
    }

    // Find product by various criteria
    const product = this.findProduct(searchTerm);
    
    if (product) {
      this.addProductToCart(product);
      this.searchInput = '';
      this.searchSuggestions = [];
      
      // Focus back to search input
      setTimeout(() => {
        if (this.searchInputRef) {
          this.searchInputRef.nativeElement.focus();
        }
      }, 100);
    } else {
      this.showError(`Produto não encontrado: "${this.searchInput}"`);
      this.searchSuggestions = this.getSearchSuggestions(searchTerm);
    }
  }

  addProductDirectly(product: PosProduct): void {
    this.addProductToCart(product);
    this.searchInput = '';
    this.searchSuggestions = [];
    
    // Focus back to search input
    setTimeout(() => {
      if (this.searchInputRef) {
        this.searchInputRef.nativeElement.focus();
      }
    }, 100);
  }

  private findProduct(searchTerm: string): PosProduct | undefined {
    return this.products.find(p => 
      // Search by exact ID
      p.id === searchTerm ||
      // Search by exact SKU
      p.sku?.toLowerCase() === searchTerm ||
      // Search by exact barcode
      p.barcode === searchTerm ||
      // Search by name (exact match first)
      p.name.toLowerCase() === searchTerm ||
      // Search by name (contains)
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  private getSearchSuggestions(searchTerm: string): PosProduct[] {
    if (searchTerm.length < 2) return [];
    
    return this.products
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.sku?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5); // Show max 5 suggestions
  }

  private addProductToCart(product: PosProduct): void {
    if (product.stock <= 0) {
      this.showError('Produto sem estoque disponível');
      return;
    }

    const existingItem = this.cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        this.showError('Quantidade não disponível em estoque');
        return;
      }
      existingItem.quantity += 1;
      this.showSuccess(`Quantidade de ${product.name} aumentada para ${existingItem.quantity}`);
    } else {
      this.cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        emoji: product.emoji
      });
      this.showSuccess(`${product.name} adicionado ao carrinho`);
    }
  }

  // Cart Management Methods
  updateQuantity(item: PosCartItem, change: number): void {
    const product = this.products.find(p => p.id === item.id);
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.removeFromCart(item);
      return;
    }

    if (product && newQuantity > product.stock) {
      this.showError('Quantidade não disponível em estoque');
      return;
    }

    item.quantity = newQuantity;
  }

  removeFromCart(item: PosCartItem): void {
    this.confirmationService.confirm({
      message: `Remover ${item.name} do carrinho?`,
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        const index = this.cartItems.findIndex(i => i.id === item.id);
        if (index > -1) {
          this.cartItems.splice(index, 1);
          this.showInfo(`${item.name} removido do carrinho`);
          
          // Focus back to search input
          setTimeout(() => {
            if (this.searchInputRef) {
              this.searchInputRef.nativeElement.focus();
            }
          }, 100);
        }
      }
    });
  }

  clearCart(): void {
    if (this.cartItems.length === 0) return;

    this.confirmationService.confirm({
      message: 'Tem certeza que deseja limpar todo o carrinho?',
      header: 'Limpar Carrinho',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.cartItems = [];
        this.discountPercent = 0;
        this.showInfo('Carrinho limpo com sucesso');
        
        // Focus back to search input
        setTimeout(() => {
          if (this.searchInputRef) {
            this.searchInputRef.nativeElement.focus();
          }
        }, 100);
      }
    });
  }

  // Calculation Methods
  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getDiscountAmount(): number {
    return this.getSubtotal() * (this.discountPercent / 100);
  }

  getTotal(): number {
    return this.getSubtotal() - this.getDiscountAmount();
  }

  calculateTotals(): void {
    if (this.discountPercent < 0) this.discountPercent = 0;
    if (this.discountPercent > 100) this.discountPercent = 100;
  }

  // Payment Methods
  selectPayment(paymentId: string): void {
    this.selectedPaymentId = paymentId;
  }

  getPaymentButtonClass(paymentId: string): string {
    const baseClass = 'text-sm font-medium rounded-lg';
    if (this.selectedPaymentId === paymentId) {
      return `${baseClass} p-button-primary`;
    }
    return `${baseClass} p-button-outlined`;
  }

  // Sale Methods
  finalizeSale(): void {
    if (this.cartItems.length === 0) {
      this.showError('Carrinho está vazio');
      return;
    }

    const total = this.getTotal();
    const paymentMethod = this.paymentMethods.find(p => p.id === this.selectedPaymentId);

    this.confirmationService.confirm({
      message: `
        <div class="text-left space-y-2">
          <p><strong>Cliente:</strong> ${this.selectedClient.name}</p>
          <p><strong>Total:</strong> ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p><strong>Pagamento:</strong> ${paymentMethod?.name}</p>
          <p><strong>Items:</strong> ${this.getTotalItems()}</p>
        </div>
        <br>
        <p>Confirmar finalização da venda?</p>
      `,
      header: 'Finalizar Venda',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.processSale();
      }
    });
  }

  suspendSale(): void {
    if (this.cartItems.length === 0) {
      this.showError('Carrinho está vazio');
      return;
    }

    this.confirmationService.confirm({
      message: 'Deseja suspender esta venda? Os itens serão salvos para finalizar depois.',
      header: 'Suspender Venda',
      icon: 'pi pi-pause',
      acceptLabel: 'Suspender',
      rejectLabel: 'Cancelar',
      accept: () => {
        // Save suspended sale to localStorage
        const suspendedSale = {
          items: [...this.cartItems],
          client: this.selectedClient,
          discount: this.discountPercent,
          payment: this.selectedPaymentId,
          timestamp: new Date()
        };
        
        localStorage.setItem('pdv_suspended_sale', JSON.stringify(suspendedSale));
        
        this.cartItems = [];
        this.discountPercent = 0;
        this.selectedPaymentId = 'dinheiro';
        
        this.showSuccess('Venda suspensa com sucesso');
        
        // Focus back to search input
        setTimeout(() => {
          if (this.searchInputRef) {
            this.searchInputRef.nativeElement.focus();
          }
        }, 100);
      }
    });
  }

  cancelSale(): void {
    if (this.cartItems.length === 0) {
      this.showError('Carrinho está vazio');
      return;
    }

    this.confirmationService.confirm({
      message: 'Tem certeza que deseja cancelar esta venda? Todos os itens serão removidos.',
      header: 'Cancelar Venda',
      icon: 'pi pi-times',
      acceptLabel: 'Cancelar Venda',
      rejectLabel: 'Manter Venda',
      accept: () => {
        this.cartItems = [];
        this.discountPercent = 0;
        this.selectedPaymentId = 'dinheiro';
        
        this.showInfo('Venda cancelada');
        
        // Focus back to search input
        setTimeout(() => {
          if (this.searchInputRef) {
            this.searchInputRef.nativeElement.focus();
          }
        }, 100);
      }
    });
  }

  private processSale(): void {
    // Simulate API call
    setTimeout(() => {
      // Update stock (in a real app, this would be done on the backend)
      this.cartItems.forEach(cartItem => {
        const product = this.products.find(p => p.id === cartItem.id);
        if (product) {
          product.stock -= cartItem.quantity;
        }
      });

      // Clear cart
      this.cartItems = [];
      this.discountPercent = 0;
      this.selectedPaymentId = 'dinheiro';

      // Show success message
      this.showSuccess('Venda finalizada com sucesso! Obrigado pela preferência.');
      
      // Focus back to search input
      setTimeout(() => {
        if (this.searchInputRef) {
          this.searchInputRef.nativeElement.focus();
        }
      }, 100);
    }, 1000);
  }

  // Client Methods
  changeClient(): void {
    this.showInfo('Funcionalidade de seleção de cliente em desenvolvimento');
  }

  // Barcode Scanner
  openBarcodeScanner(): void {
    // In a real app, this would open camera for barcode scanning
    // For now, simulate scanning a random product
    const randomProduct = this.products[Math.floor(Math.random() * this.products.length)];
    
    this.showInfo(`Scanner simulado: ${randomProduct.name}`);
    this.addProductToCart(randomProduct);
    
    // Focus back to search input
    setTimeout(() => {
      if (this.searchInputRef) {
        this.searchInputRef.nativeElement.focus();
      }
    }, 1000);
  }

  // Message Methods
  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: message,
      life: 5000
    });
  }

  private showInfo(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Informação',
      detail: message,
      life: 3000
    });
  }

  // Keyboard Shortcuts
  onKeyDown(event: KeyboardEvent): void {
    // F1 - Focus search
    if (event.key === 'F1') {
      event.preventDefault();
      if (this.searchInputRef) {
        this.searchInputRef.nativeElement.focus();
      }
    }
    
    // F2 - Open scanner
    if (event.key === 'F2') {
      event.preventDefault();
      this.openBarcodeScanner();
    }
    
    // F9 - Finalize sale
    if (event.key === 'F9' && this.cartItems.length > 0) {
      event.preventDefault();
      this.finalizeSale();
    }
    
    // F10 - Clear cart
    if (event.key === 'F10' && this.cartItems.length > 0) {
      event.preventDefault();
      this.clearCart();
    }
  }
}
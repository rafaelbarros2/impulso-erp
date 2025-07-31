import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { StoreTheme, ThemeService } from '../../../../core/services/theme-service.service';

interface ProductDisplay {
  id: string;
  name: string;
  description: string;
  fullDescription?: string; // Para quick view
  price: number;
  imageUrl: string;
  category: string;
  stock?: number;
  isNew?: boolean;
}

interface CartItem {
  product: ProductDisplay;
  quantity: number;
}

@Component({
  selector: 'app-storefront-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    DialogModule,
    ToastModule
  ],
  providers: [CurrencyPipe, MessageService],
  templateUrl: './storefront-page.component.html',
  styleUrl: './storefront-page.component.scss'
})
export class StorefrontPageComponent implements OnInit, OnDestroy {
  // Observables e Subscriptions
  currentTheme$: Observable<StoreTheme | null>;
  availableThemes: StoreTheme[] = [];
  selectedTheme: StoreTheme | null = null;
  private themeSubscription: Subscription | undefined;

  // Layout State
  currentLayout: 'grid' | 'list' = 'grid';
  
  // Cart State
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  showMiniCart: boolean = false;
  
  // Quick View Modal State
  showQuickView: boolean = false;
  quickViewProduct: ProductDisplay | null = null;

  // Produtos mockados para exibição na loja
  products: ProductDisplay[] = [
    {
      id: 'prod1',
      name: 'Vestido Floral Verão',
      description: 'Leve e elegante, perfeito para dias ensolarados.',
      fullDescription: 'Vestido leve e elegante, perfeito para dias ensolarados. Tecido respirável com estampa exclusiva que valoriza sua silhueta. Ideal para ocasiões casuais e encontros especiais. Modelagem que acompanha os movimentos do corpo com naturalidade.',
      price: 119.90,
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Vestidos',
      stock: 15,
      isNew: true
    },
    {
      id: 'prod2',
      name: 'Calça Jeans Skinny',
      description: 'Conforto e estilo para o seu dia a dia.',
      fullDescription: 'Calça jeans com modelagem skinny que valoriza o corpo. Tecido de alta qualidade e durabilidade. Perfeita para compor looks casuais e elegantes. Design atemporal que combina com qualquer estilo.',
      price: 89.50,
      imageUrl: 'https://images.unsplash.com/photo-1541099645167-bb809425f705?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Calças',
      stock: 22
    },
    {
      id: 'prod3',
      name: 'Blusa de Seda Branca',
      description: 'Toque suave e caimento perfeito para qualquer ocasião.',
      fullDescription: 'Blusa de seda natural com toque suave e caimento perfeito. Elegante e sofisticada, ideal para o ambiente profissional ou eventos especiais. Seda de alta qualidade que proporciona conforto durante todo o dia.',
      price: 69.90,
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aec6fc87e?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Blusas',
      stock: 8
    },
    {
      id: 'prod4',
      name: 'Tênis Esportivo Casual',
      description: 'Ideal para caminhadas e um look despojado.',
      fullDescription: 'Tênis com tecnologia de absorção de impacto e design moderno. Conforto durante todo o dia com estilo urbano contemporâneo. Ideal para atividades físicas e uso casual.',
      price: 189.99,
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Calçados',
      stock: 12
    },
    {
      id: 'prod5',
      name: 'Saia Plissada Midi',
      description: 'Elegância e movimento para o seu guarda-roupa.',
      fullDescription: 'Saia plissada com comprimento midi que combina elegância e praticidade. Tecido fluido que acompanha os movimentos com leveza. Perfeita para ocasiões especiais e eventos corporativos.',
      price: 95.00,
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d2d?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Saias',
      stock: 18,
      isNew: true
    },
    {
      id: 'prod6',
      name: 'Bolsa de Couro Clássica',
      description: 'Acessório indispensável para completar seu estilo.',
      fullDescription: 'Bolsa de couro legítimo de alta qualidade. Design clássico e atemporal que combina com qualquer look. Espaçosa e funcional, com compartimentos organizados para suas necessidades diárias.',
      price: 299.00,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Acessórios',
      stock: 5
    },
    {
      id: 'prod7',
      name: 'Cardigan de Tricot',
      description: 'Aconchego e estilo para os dias mais frescos.',
      fullDescription: 'Cardigan em tricot macio e confortável. Peça versátil que pode ser usada em diferentes ocasiões. Modelagem clássica que favorece todos os tipos de corpo.',
      price: 129.90,
      imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Cardigans',
      stock: 10
    },
    {
      id: 'prod8',
      name: 'Sandália de Salto Médio',
      description: 'Elegante e confortável para usar o dia todo.',
      fullDescription: 'Sandália com salto médio que combina elegância e conforto. Design moderno e atemporal que valoriza os pés. Ideal para uso profissional e social.',
      price: 159.90,
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Calçados',
      stock: 14
    }
  ];

  constructor(
    private themeService: ThemeService,
    private messageService: MessageService
  ) {
    this.currentTheme$ = this.themeService.currentTheme$;
  }

  ngOnInit(): void {
    this.loadAvailableThemes();
    this.syncSelectedTheme();
    this.showWelcomeMessage();
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
  }

  // ================== THEME METHODS ==================

  /**
   * Carrega temas disponíveis do serviço
   */
  private loadAvailableThemes(): void {
    this.availableThemes = this.themeService.getAvailableThemes();
  }

  /**
   * Sincroniza o tema selecionado com o tema atual
   */
  private syncSelectedTheme(): void {
    this.themeSubscription = this.currentTheme$.subscribe(theme => {
      if (theme) {
        this.selectedTheme = theme;
      }
    });
  }

  /**
   * Aplica o tema selecionado
   */
  onThemeChange(event: any): void {
    const themeId = event.value.id;
    this.themeService.applyTheme(themeId);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Tema Alterado',
      detail: `Tema "${event.value.name}" aplicado com sucesso!`,
      life: 3000
    });
  }

  // ================== LAYOUT METHODS ==================

  /**
   * Alterna entre layouts grid e list
   */
  switchLayout(layout: 'grid' | 'list'): void {
    this.currentLayout = layout;
    
    this.messageService.add({
      severity: 'info',
      summary: 'Layout Alterado',
      detail: `Visualização alterada para ${layout === 'grid' ? 'Grade' : 'Lista'}`,
      life: 2000
    });
  }

  /**
   * Retorna classes CSS baseadas no layout atual
   */
  getLayoutClasses(): string {
    return this.currentLayout === 'grid' ? 'layout-grid' : 'layout-list';
  }

  // ================== CART METHODS ==================

  /**
   * Adiciona produto ao carrinho
   */
  addToCart(product: ProductDisplay): void {
    // Verifica estoque
    if (product.stock && product.stock <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Produto Indisponível',
        detail: `${product.name} está fora de estoque.`,
        life: 3000
      });
      return;
    }

    // Verifica se produto já existe no carrinho
    const existingItem = this.cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
      this.messageService.add({
        severity: 'info',
        summary: 'Quantidade Atualizada',
        detail: `${product.name} - Quantidade: ${existingItem.quantity}`,
        life: 2000
      });
    } else {
      this.cartItems.push({ product, quantity: 1 });
      this.messageService.add({
        severity: 'success',
        summary: 'Produto Adicionado',
        detail: `${product.name} foi adicionado ao carrinho!`,
        life: 2000
      });
    }

    // Atualiza total e reduz estoque
    this.updateCartTotal();
    if (product.stock) {
      product.stock -= 1;
    }

    // Mostra mini carrinho brevemente
    this.showMiniCart = true;
    setTimeout(() => {
      this.showMiniCart = false;
    }, 3000);
  }

  /**
   * Remove item do carrinho
   */
  removeFromCart(productId: string): void {
    const itemIndex = this.cartItems.findIndex(item => item.product.id === productId);
    if (itemIndex > -1) {
      const removedItem = this.cartItems[itemIndex];
      
      // Restaura estoque
      if (removedItem.product.stock !== undefined) {
        removedItem.product.stock += removedItem.quantity;
      }
      
      this.cartItems.splice(itemIndex, 1);
      this.updateCartTotal();
      
      this.messageService.add({
        severity: 'info',
        summary: 'Item Removido',
        detail: `${removedItem.product.name} foi removido do carrinho`,
        life: 2000
      });
    }
  }

  /**
   * Atualiza o total do carrinho
   */
  private updateCartTotal(): void {
    this.cartTotal = this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  /**
   * Retorna quantidade total de itens no carrinho
   */
  getCartItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Alterna visibilidade do mini carrinho
   */
  toggleMiniCart(): void {
    this.showMiniCart = !this.showMiniCart;
  }

  // ================== QUICK VIEW METHODS ==================

  /**
   * Abre modal de visualização rápida
   */
  openQuickView(product: ProductDisplay): void {
    this.quickViewProduct = product;
    this.showQuickView = true;
  }

  /**
   * Fecha modal de visualização rápida
   */
  closeQuickView(): void {
    this.showQuickView = false;
    this.quickViewProduct = null;
  }

  /**
   * Adiciona produto ao carrinho via quick view
   */
  addToCartFromQuickView(): void {
    if (this.quickViewProduct) {
      this.addToCart(this.quickViewProduct);
      this.closeQuickView();
    }
  }

  // ================== UTILITY METHODS ==================

  /**
   * TrackBy function para otimizar *ngFor
   */
  trackByProductId(index: number, product: ProductDisplay): string {
    return product.id;
  }

  /**
   * Fallback para imagens que não carregam
   */
  onImageError(event: any): void {
    const fallbackImages = [
      'https://placehold.co/300x300/E0E7FF/3B82F6?text=Produto',
      'https://placehold.co/300x300/F0FDF4/10B981?text=Moda',
      'https://placehold.co/300x300/FEF3C7/F59E0B?text=Fashion'
    ];
    
    const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    event.target.src = randomFallback;
  }

  /**
   * Verifica se produto está com estoque baixo
   */
  isLowStock(product: ProductDisplay): boolean {
    return product.stock ? product.stock <= 5 : false;
  }

  /**
   * Verifica se produto está fora de estoque
   */
  isOutOfStock(product: ProductDisplay): boolean {
    return product.stock ? product.stock <= 0 : false;
  }

  /**
   * Retorna título da seção baseado no layout
   */
  getSectionTitle(): string {
    return this.currentLayout === 'grid' ? 'Nossos Produtos' : 'Coleção Exclusiva';
  }

  /**
   * Retorna texto do hero banner baseado no layout
   */
  getHeroBannerData(): any {
    if (this.currentLayout === 'grid') {
      return {
        title: 'Nova Coleção Verão 2025',
        subtitle: 'Descubra as últimas tendências em moda feminina.',
        buttonText: 'Compre Agora'
      };
    } else {
      return {
        category: 'COLEÇÃO EXCLUSIVA',
        title: 'Elegância Atemporal',
        description: 'Peças cuidadosamente selecionadas para mulheres que valorizam qualidade, sofisticação e design contemporâneo. Uma curadoria especial para seu guarda-roupa.',
        primaryButton: 'Explorar Coleção',
        secondaryButton: 'Ver Lookbook'
      };
    }
  }

  /**
   * Mensagem de boas-vindas
   */
  private showWelcomeMessage(): void {
    setTimeout(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Bem-vindo à FashionERP Store!',
        detail: 'Experimente diferentes temas e layouts para personalizar sua experiência.',
        life: 4000
      });
    }, 1000);
  }

  /**
   * Faz scroll suave até a seção de produtos
   */
  scrollToProducts(): void {
    // Pequeno delay para garantir que o DOM está atualizado
    setTimeout(() => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        
        // Feedback visual
        this.messageService.add({
          severity: 'info',
          summary: 'Produtos',
          detail: 'Veja nossa seleção especial!',
          life: 2000
        });
      }
    }, 150);
  }

  /**
   * Simula processo de checkout
   */
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Carrinho Vazio',
        detail: 'Adicione produtos ao carrinho antes de finalizar a compra.',
        life: 3000
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Redirecionando...',
      detail: 'Você será redirecionado para o checkout em instantes.',
      life: 3000
    });

    // Aqui seria implementada a navegação para o checkout
    // this.router.navigate(['/checkout']);
  }
}
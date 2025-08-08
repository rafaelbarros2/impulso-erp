import { Component, OnInit, inject, Signal, effect, HostBinding } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { Router } from '@angular/router';
import { LayoutService } from '../../../../core/services/layout.service';
import { BackgroundService } from '../../../../core/services/background.service';
import { OnlineProductService } from '../../../../core/services/online-product.service';
import { CartService } from '../../../../core/services/cart.service';

// Importa os componentes filhos e a interface Product
import { StorefrontHeaderComponent } from '../../components/storefront-header/storefront-header.component';
import { StorefrontHeroComponent } from '../../components/storefront-hero/storefront-hero.component';
import { StorefrontCategoriesComponent } from '../../components/storefront-categories/storefront-categories.component';
import { StorefrontItemGridComponent } from '../../components/storefront-item-grid/storefront-item-grid.component';
import { OnlineProduct, CartItem, BadgeType, LayoutType, StoreTheme } from '../../../../core/models';
import { ThemeService } from '../../../../core/services/theme-service.service';

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
    ToastModule,
    // Componentes filhos
    StorefrontHeaderComponent,
    StorefrontHeroComponent,
    StorefrontCategoriesComponent,
    StorefrontItemGridComponent
  ],
  providers: [CurrencyPipe, MessageService],
  templateUrl: './storefront-page.component.html',
  styleUrls: ['./storefront-page.component.scss']
})
export class StorefrontPageComponent implements OnInit {

  // Injeção de dependências
  private readonly layoutService = inject(LayoutService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly backgroundService = inject(BackgroundService);
  private readonly onlineProductService = inject(OnlineProductService);
  private readonly cartService = inject(CartService);

  // Propriedades reativas usando Signals do serviço
  currentTheme: Signal<StoreTheme | null> = this.themeService.currentTheme;
  currentLayout: Signal<LayoutType> = this.layoutService.currentLayout;
  showHeroBanner: Signal<boolean> = this.layoutService.heroVisible;
  showCategories: Signal<boolean> = this.layoutService.categoriesVisible;

  // HostBinding para aplicar classes ao elemento host
  @HostBinding('class') get hostClasses(): string {
    return `storefront-page layout-${this.currentLayout()}`;
  }

  // Products loaded from API
  products: any[] = [];
  isLoadingProducts = false;
  hasError = false;

  cartItems: CartItem[] = [];
  cartTotalValue = 0;
  cartItemCount = 0;

  // Estado do Quick View
  showQuickView = false;
  quickViewProduct: any | null = null;
  quickViewQuantity = 1;

  constructor() {
    // Effect para monitorar mudanças de layout
    effect(() => {
      //console.log('🏪 StorefrontPage detectou mudança de layout:', this.currentLayout());
      //console.log('🏪 Classes aplicadas no host:', this.hostClasses);
    });
  }

  ngOnInit(): void {
    // Load products from API
    this.loadProducts();
    
    // Load current cart
    this.loadCart();
    
    // Mensagem de boas-vindas
    this.showWelcomeMessage();
    
    // Debug inicial
    //console.log('🏪 StorefrontPage inicializada');
    //console.log('🏪 Layout inicial:', this.currentLayout());
    
    setTimeout(() => {
      this.debugLayoutState();
    }, 2000);
  }

  /**
   * Load products from API
   */
  loadProducts(): void {
    this.isLoadingProducts = true;
    this.hasError = false;
    
    this.onlineProductService.getAllOnlineProducts().subscribe({
      next: (onlineProducts: OnlineProduct[]) => {
        this.products = onlineProducts.map(product => this.convertOnlineProductToProduct(product));
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading online products:', error);
        this.hasError = true;
        this.isLoadingProducts = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro de Conexão',
          detail: 'Não foi possível carregar os produtos da loja online.',
          life: 5000
        });
      }
    });
  }

  /**
   * Load current cart from API
   */
  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        this.cartTotalValue = cart.total;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        // Don't show error message for cart loading, it's not critical
      }
    });
  }

  /**
   * Convert OnlineProduct to Product interface
   */
  private convertOnlineProductToProduct(onlineProduct: OnlineProduct): any {
    const hasDiscount = onlineProduct.oldPrice && onlineProduct.oldPrice > onlineProduct.price;
    const badges = [];
    
    if (hasDiscount) {
      const discountPercent = Math.round(((onlineProduct.oldPrice! - onlineProduct.price) / onlineProduct.oldPrice!) * 100);
      badges.push({ type: BadgeType.SALE, label: `-${discountPercent}%` });
    }
    
    if (onlineProduct.featured) {
      badges.push({ type: BadgeType.FEATURED, label: 'Destaque' });
    }

    return {
      id: onlineProduct.id?.toString() || '',
      name: onlineProduct.name,
      description: onlineProduct.description || '',
      image: onlineProduct.images?.[0] || `https://placehold.co/400x400/E0F2F1/000000?text=${encodeURIComponent(onlineProduct.name.substring(0, 8))}`,
      imageAlt: onlineProduct.name,
      price: onlineProduct.price,
      oldPrice: hasDiscount ? onlineProduct.price : undefined,
      discountPercent: hasDiscount ? Math.round(((onlineProduct.oldPrice! - onlineProduct.price) / onlineProduct.oldPrice!) * 100) : undefined,
      rating: { average: 4.5, count: Math.floor(Math.random() * 100) + 10, stars: 5 }, // Mock rating for now
      badges,
      category: onlineProduct.category || 'Produto',
      inStock: onlineProduct.inStock,
      featured: onlineProduct.featured || false,
    };
  }

  /**
   * NOVO: Retorna classes específicas para o grid de produtos
   */
  getGridClasses(): string {
    return `layout-${this.currentLayout()}`;
  }

  /**
   * ADICIONADO: Método para debug do estado do layout
   */
  debugLayoutState(): void {
    // //console.log('🐛 ===== DEBUG STOREFRONT PAGE =====');
    // //console.log('🐛 Layout atual:', this.currentLayout());
    // //console.log('🐛 Hero visível:', this.showHeroBanner());
    // //console.log('🐛 Categories visíveis:', this.showCategories());
    // //console.log('🐛 Tema atual:', this.currentTheme()?.name);
    // //console.log('🐛 Classes CSS aplicadas:', this.getLayoutClasses());
    // //console.log('🐛 Classes do grid:', this.getGridClasses());
    // //console.log('🐛 Layout Service Debug:', this.layoutService.getDebugState());
    // //console.log('🐛 Produtos carregados:', this.products.length);
    // //console.log('🐛 ================================');
  }

  /**
   * Retorna as classes CSS para o layout
   */
  getLayoutClasses(): string {
    let classes = `storefront-${this.currentLayout()}`;
    if (!this.showHeroBanner()) {
      classes += ' no-hero';
    }
    if (!this.showCategories()) {
      classes += ' no-categories';
    }
    //console.log('🎨 Classes CSS aplicadas:', classes);
    return classes;
  }

  /**
   * Adiciona um produto ao carrinho
   */
  addToCart(product: OnlineProduct): void {
    // Verifica se produto está em estoque
    if (!product.inStock) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Produto Indisponível',
        detail: `${product.name} está fora de estoque.`,
        life: 3000
      });
      return;
    }

    // Use API to add to cart
    const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
    if (isNaN(productId)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'ID do produto inválido.',
        life: 3000
      });
      return;
    }

    this.cartService.addToCart(productId, 1).subscribe({
      next: (cart) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Adicionado ao Carrinho',
          detail: `${product.name} foi adicionado ao carrinho!`,
          life: 2000
        });
        // Update local cart info from API response
        this.cartItemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        this.cartTotalValue = cart.total;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível adicionar o produto ao carrinho.',
          life: 3000
        });
      }
    });
  }
  

  /**
   * Abre o quick view do produto
   */
  openQuickView(product: OnlineProduct): void {
    this.quickViewProduct = product;
    this.quickViewQuantity = 1; // Reseta a quantidade
    this.showQuickView = true;
  }

  /**
   * Fecha o quick view
   */
  closeQuickView(): void {
    this.showQuickView = false;
    this.quickViewProduct = null;
  }

  /**
   * Adiciona o produto do quick view ao carrinho
   */
  addToCartFromQuickView(): void {
    if (this.quickViewProduct) {
      // Verifica estoque antes de adicionar
      if (!this.quickViewProduct.inStock) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Produto Indisponível',
          detail: `${this.quickViewProduct.name} está fora de estoque.`,
          life: 3000
        });
        this.closeQuickView();
        return;
      }

      // Use API to add to cart
      const productId = typeof this.quickViewProduct.id === 'string' ? parseInt(this.quickViewProduct.id) : this.quickViewProduct.id;
      if (isNaN(productId)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'ID do produto inválido.',
          life: 3000
        });
        this.closeQuickView();
        return;
      }

      this.cartService.addToCart(productId, this.quickViewQuantity).subscribe({
        next: (cart) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Adicionado ao Carrinho',
            detail: `${this.quickViewProduct!.name} foi adicionado ao carrinho!`,
            life: 2500
          });
          // Update local cart info from API response
          this.cartItemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
          this.cartTotalValue = cart.total;
          this.closeQuickView();
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível adicionar o produto ao carrinho.',
            life: 3000
          });
          this.closeQuickView();
        }
      });
    }
  }

  /**
   * Retorna se o produto tem desconto
   */
  hasDiscount(product: OnlineProduct): boolean {
    return !!product.oldPrice && product.oldPrice > product.price;
  }

  /**
   * Calcula a porcentagem de desconto
   */
  getDiscountPercentage(product: OnlineProduct): number {
    if (!this.hasDiscount(product)) return 0;
    return Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100);
  }

  /**
   * Formata preço para exibição
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  /**
   * Manipula o clique no logo, navegando para a home
   */
  onLogoClick(): void {
    this.router.navigate(['/']);
  }

  /**
   * Manipula o clique no carrinho, navegando para a página do carrinho
   */
  onCartClick(): void {
    this.router.navigate(['/cart']);
  }

  /**
   * Manipula clique no produto para ir para página de detalhes
   */
  onProductClick(product: OnlineProduct): void {
    //console.log('Navegando para produto:', product.name);
    // this.router.navigate(['/ecommerce/product', product.id]);
  }

  /**
   * Manipula evento de favoritar produto
   */
  onFavoriteToggle(product: OnlineProduct): void {
    //console.log('Produto favoritado:', product.name);
    this.messageService.add({
      severity: 'info',
      summary: 'Favoritos',
      detail: `${product.name} foi ${Math.random() > 0.5 ? 'adicionado aos' : 'removido dos'} favoritos`,
      life: 2000
    });
  }

  /**
   * Manipula evento de comparar produto
   */
  onCompareProduct(product: OnlineProduct): void {
    //console.log('Produto para comparação:', product.name);
    this.messageService.add({
      severity: 'info',
      summary: 'Comparação',
      detail: `${product.name} adicionado à comparação`,
      life: 2000
    });
  }

  /**
   * Mensagem de boas-vindas
   */
  private showWelcomeMessage(): void {
    setTimeout(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Bem-vindo à FashionERP Store!',
        detail: 'Experimente os diferentes layouts: Grid (moderno) e Minimal (minimalista)',
        life: 5000
      });
    }, 1000);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = 'https://placehold.co/600x400/E0E7FF/3B82F6?text=Produto';
    }
  }
}
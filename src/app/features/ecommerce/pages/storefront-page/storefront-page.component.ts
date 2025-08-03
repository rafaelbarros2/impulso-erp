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
import { LayoutService, LayoutType } from '../../../../core/services/layout.service';
import { BackgroundService } from '../../../../core/services/background.service';

// Importa os componentes filhos e a interface Product
import { StorefrontHeaderComponent } from '../../components/storefront-header/storefront-header.component';
import { StorefrontHeroComponent } from '../../components/storefront-hero/storefront-hero.component';
import { StorefrontCategoriesComponent } from '../../components/storefront-categories/storefront-categories.component';
import { StorefrontItemGridComponent } from '../../components/storefront-item-grid/storefront-item-grid.component';
import { BadgeType, Product } from '../../model/product.interface';
import { StoreTheme, ThemeService } from '../../../../core/services/theme-service.service';

/**
 * Interface para um item no carrinho de compras.
 */
interface CartItem {
  product: Product;
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
    ToastModule,
    // Componentes filhos
    StorefrontHeaderComponent,
    StorefrontHeroComponent,
    StorefrontCategoriesComponent,
    StorefrontItemGridComponent
  ],
  providers: [CurrencyPipe, MessageService],
  template: `
    <div class="storefront-container" 
         [ngClass]="getLayoutClasses()" 
         [attr.data-layout]="currentLayout()"
         [attr.data-theme]="currentTheme()?.id">
      <p-toast position="top-right"></p-toast>

      <!-- Header da Loja - Componente storefront-header -->
      <app-storefront-header
        [storeName]="'FashionERP Store'"
        [cartInfo]="{ itemCount: cartItemCount, totalValue: cartTotalValue }"
        [showLogo]="true"
        [showControls]="true"
        [showHeroControls]="true"
        [showCategoriesControls]="true"
        (cartClicked)="onCartClick()"
        (logoClicked)="onLogoClick()"
      ></app-storefront-header>

      <!-- Hero Banner - Componente storefront-hero -->
      <app-storefront-hero *ngIf="showHeroBanner()"></app-storefront-hero>

      <main class="store-main" [attr.data-layout]="currentLayout()">
        
        <!-- Seção de Categorias - Componente storefront-categories -->
        <app-storefront-categories *ngIf="showCategories()"></app-storefront-categories>

        <!-- Lista de Produtos - Componente storefront-item-grid -->
        <section class="products-section" [attr.data-layout]="currentLayout()">
          <h2 class="section-title">Nossa Coleção Exclusiva</h2>
          
          <!-- DEBUG: Mostra o layout atual (remover em produção) -->
          <div class="layout-debug" 
               style="margin-bottom: 1rem; padding: 0.75rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 8px; font-size: 0.875rem; font-weight: 600; border: 2px solid #667eea; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
            <strong>🎯 Layout Atual:</strong> {{ currentLayout() | uppercase }} 
            <button type="button" 
                    (click)="debugLayoutState()" 
                    style="margin-left: 1rem; padding: 0.25rem 0.5rem; font-size: 0.75rem; background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 4px; cursor: pointer; transition: all 0.2s ease;"
                    onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.transform='scale(1.05)'"
                    onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='scale(1)'">
              🐛 Debug Console
            </button>
            <span style="margin-left: 1rem; font-size: 0.75rem; opacity: 0.9;">
              ({{ products.length }} produtos • Tema: {{ currentTheme()?.name }})
            </span>
          </div>
          
          <!-- Grid de Produtos com Classes Dinâmicas -->
          <app-storefront-item-grid
            [ngClass]="getGridClasses()"
            [products]="products"
            [loading]="false"
            [showActions]="true"
            [showRating]="currentLayout() === 'grid'"
            [showDescription]="currentLayout() === 'grid'"
            (productClick)="onProductClick($event)"
            (addToCart)="addToCart($event)"
            (favoriteToggle)="onFavoriteToggle($event)"
            (compareProduct)="onCompareProduct($event)"
            (quickView)="openQuickView($event)"
          ></app-storefront-item-grid>
        </section>
      </main>

      <!-- Quick View Modal -->
      <p-dialog 
        [header]="quickViewProduct?.name" 
        [(visible)]="showQuickView" 
        [modal]="true" 
        [style]="{width: '90vw', maxWidth: '700px'}" 
        [baseZIndex]="10000"
        styleClass="quick-view-dialog"
        (onHide)="closeQuickView()"
      >
        <div class="modal-content" *ngIf="quickViewProduct">
          <div class="modal-image-container">
            <img 
              [src]="quickViewProduct.image" 
              [alt]="quickViewProduct.imageAlt || quickViewProduct.name" 
              class="modal-product-image"
              (error)="onImageError($event)"
            />
            
            <!-- Badges do produto -->
            <div class="modal-badges" *ngIf="quickViewProduct.badges && quickViewProduct.badges.length > 0">
              <span *ngFor="let badge of quickViewProduct.badges" 
                    [ngClass]="'badge-' + badge.type"
                    class="modal-badge">
                {{ badge.label }}
              </span>
            </div>
            
            <!-- Badge de desconto -->
            <div class="discount-badge" *ngIf="hasDiscount(quickViewProduct)">
              -{{ getDiscountPercentage(quickViewProduct) }}%
            </div>
          </div>
          
          <div class="modal-details">
            <h3 class="modal-product-name">{{ quickViewProduct.name }}</h3>
            
            <!-- Rating System -->
            <div class="modal-rating" *ngIf="quickViewProduct.rating">
              <div class="stars">
                <i *ngFor="let star of [1,2,3,4,5]" 
                   [class]="star <= quickViewProduct.rating.stars ? 'pi pi-star-fill star' : 'pi pi-star star'">
                </i>
              </div>
              <span class="rating-count">({{ quickViewProduct.rating.count }} avaliações)</span>
              <span class="rating-average">{{ quickViewProduct.rating.average }}/5</span>
            </div>
            
            <!-- Preços -->
            <div class="modal-price-container">
              <div class="current-price">{{ formatPrice(quickViewProduct.price) }}</div>
              <div class="old-price" *ngIf="quickViewProduct.oldPrice">
                {{ formatPrice(quickViewProduct.oldPrice) }}
              </div>
              <div class="discount-text" *ngIf="hasDiscount(quickViewProduct)">
                Economize {{ formatPrice(quickViewProduct.oldPrice! - quickViewProduct.price) }}
              </div>
            </div>
            
            <!-- Descrição do produto -->
            <div class="product-details">
              <p class="modal-product-description">
                {{ quickViewProduct.description }}
              </p>
              
              <!-- Meta informações -->
              <div class="product-meta">
                <div class="meta-item">
                  <strong>Categoria:</strong> {{ quickViewProduct.category }}
                </div>
                <div class="meta-item">
                  <strong>Status:</strong> 
                  <span [ngClass]="{
                    'text-green-600': quickViewProduct.inStock,
                    'text-red-600': !quickViewProduct.inStock
                  }">
                    {{ quickViewProduct.inStock ? 'Disponível' : 'Fora de estoque' }}
                  </span>
                </div>
                <div class="meta-item" *ngIf="quickViewProduct.featured">
                  <strong>Produto em destaque</strong>
                  <i class="pi pi-star-fill text-yellow-500 ml-1"></i>
                </div>
              </div>
            </div>
            
            <!-- Controles de quantidade (se em estoque) -->
            <div class="quantity-controls" *ngIf="quickViewProduct.inStock">
              <label for="quantity">Quantidade:</label>
              <div class="quantity-input-group">
                <button 
                  type="button" 
                  class="quantity-btn" 
                  (click)="quickViewQuantity = quickViewQuantity > 1 ? quickViewQuantity - 1 : 1"
                  [disabled]="quickViewQuantity <= 1"
                >
                  <i class="pi pi-minus"></i>
                </button>
                <input 
                  type="number" 
                  id="quantity"
                  [(ngModel)]="quickViewQuantity" 
                  min="1" 
                  max="10"
                  class="quantity-input"
                />
                <button 
                  type="button" 
                  class="quantity-btn" 
                  (click)="quickViewQuantity = quickViewQuantity < 10 ? quickViewQuantity + 1 : 10"
                  [disabled]="quickViewQuantity >= 10"
                >
                  <i class="pi pi-plus"></i>
                </button>
              </div>
            </div>
            
            <!-- Ações do modal -->
            <div class="modal-actions">
              <button 
                class="modal-add-cart-btn" 
                (click)="addToCartFromQuickView()"
                [disabled]="!quickViewProduct.inStock"
                type="button"
              >
                <i class="pi pi-shopping-cart mr-2"></i>
                <span *ngIf="quickViewProduct.inStock; else outOfStockText">
                  Adicionar {{ quickViewQuantity > 1 ? quickViewQuantity + ' itens' : '' }} ao Carrinho
                </span>
                <ng-template #outOfStockText>
                  Produto Esgotado
                </ng-template>
              </button>
              
              <!-- Botões secundários -->
              <div class="secondary-actions">
                <button 
                  class="secondary-btn" 
                  (click)="onFavoriteToggle(quickViewProduct)"
                  type="button"
                >
                  <i class="pi pi-heart mr-2"></i>
                  Favoritar
                </button>
                <button 
                  class="secondary-btn" 
                  (click)="onCompareProduct(quickViewProduct)"
                  type="button"
                >
                  <i class="pi pi-chart-line mr-2"></i>
                  Comparar
                </button>
              </div>
            </div>
          </div>
        </div>
      </p-dialog>
    </div>
  `,
  styleUrls: ['./storefront-page.component.scss']
})
export class StorefrontPageComponent implements OnInit {

  // Injeção de dependências
  private readonly layoutService = inject(LayoutService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly backgroundService = inject(BackgroundService);

  // Propriedades reativas usando Signals do serviço
  currentTheme: Signal<StoreTheme | null> = this.themeService.currentTheme;
  currentLayout: Signal<LayoutType> = this.layoutService.currentLayout;
  showHeroBanner: Signal<boolean> = this.layoutService.heroVisible;
  showCategories: Signal<boolean> = this.layoutService.categoriesVisible;

  // HostBinding para aplicar classes ao elemento host
  @HostBinding('class') get hostClasses(): string {
    return `storefront-page layout-${this.currentLayout()}`;
  }

  // Produtos de exemplo
  products: Product[] = [
    {
      id: '1',
      name: 'Jaqueta de Couro Clássica',
      description: 'Jaqueta de couro genuíno, perfeita para qualquer ocasião. Corte moderno com detalhes em zíper e bolsos laterais. Material de alta qualidade que oferece durabilidade e estilo atemporal.',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=400&h=400',
      imageAlt: 'Jaqueta de Couro Clássica',
      price: 1500.00,
      oldPrice: 1800.00,
      discountPercent: 15,
      rating: { average: 4.5, count: 58, stars: 5 },
      badges: [{ type: BadgeType.SALE, label: '-15%' }, { type: BadgeType.FEATURED, label: 'Destaque' }],
      category: 'Jaquetas',
      inStock: true,
      featured: true,
    },
    {
      id: '2',
      name: 'Vestido Florido de Verão',
      description: 'Vestido leve e confortável com estampa floral exclusiva, ideal para o verão. Tecido respirável e corte que valoriza a silhueta. Perfeito para ocasiões casuais e encontros especiais.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400&h=400',
      imageAlt: 'Vestido Florido de Verão',
      price: 350.00,
      rating: { average: 4.8, count: 120, stars: 5 },
      badges: [{ type: BadgeType.NEW, label: 'Novo' }],
      category: 'Vestidos',
      inStock: true,
      featured: false,
    },
    {
      id: '3',
      name: 'Tênis Esportivo Pro',
      description: 'Tênis de alta performance para corrida e treino. Tecnologia de absorção de impacto, sola antiderrapante e design ergonômico. Conforto e performance em cada passo.',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aec6fc87e?auto=format&fit=crop&q=80&w=400&h=400',
      imageAlt: 'Tênis Esportivo Pro',
      price: 890.00,
      rating: { average: 4.2, count: 23, stars: 4 },
      badges: [{ type: BadgeType.SALE, label: '-30%' }],
      category: 'Calçados',
      inStock: false,
      featured: false,
    },
    {
      id: '4',
      name: 'Calça Jeans Slim',
      description: 'Calça jeans com corte slim moderno e versátil. Tecido de alta qualidade com elastano para maior conforto. Disponível em lavagem stone com acabamento premium.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400&h=400',
      imageAlt: 'Calça Jeans Slim',
      price: 280.00,
      rating: { average: 4.6, count: 75, stars: 5 },
      badges: [],
      category: 'Calças',
      inStock: true,
      featured: false,
    },
    {
      id: '5',
      name: 'Camiseta Básica de Algodão',
      description: 'Camiseta 100% algodão pré-encolhido, macia e durável. Corte clássico unissex, essencial no guarda-roupa. Disponível em várias cores básicas.',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=400&h=400',
      imageAlt: 'Camiseta Básica de Algodão',
      price: 80.00,
      rating: { average: 4.9, count: 200, stars: 5 },
      badges: [{ type: BadgeType.NEW, label: 'Novo' }],
      category: 'Camisetas',
      inStock: true,
      featured: false,
    },
    {
      id: '6',
      name: 'Óculos de Sol Aviador',
      description: 'Óculos de sol estilo aviador clássico com proteção UV 400. Armação resistente e lentes polarizadas. Design atemporal que combina com qualquer estilo.',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=400&h=400',
      imageAlt: 'Óculos de Sol Aviador',
      price: 450.00,
      rating: { average: 4.7, count: 42, stars: 5 },
      badges: [{ type: BadgeType.FEATURED, label: 'Destaque' }],
      category: 'Acessórios',
      inStock: true,
      featured: true,
    }
  ];

  cartItems: CartItem[] = [];
  cartTotalValue = 0;
  cartItemCount = 0;

  // Estado do Quick View
  showQuickView = false;
  quickViewProduct: Product | null = null;
  quickViewQuantity = 1;

  constructor() {
    // Effect para monitorar mudanças de layout
    effect(() => {
      console.log('🏪 StorefrontPage detectou mudança de layout:', this.currentLayout());
      console.log('🏪 Classes aplicadas no host:', this.hostClasses);
    });
  }

  ngOnInit(): void {
    // Mensagem de boas-vindas
    this.showWelcomeMessage();
    
    // Debug inicial
    console.log('🏪 StorefrontPage inicializada');
    console.log('🏪 Layout inicial:', this.currentLayout());
    
    setTimeout(() => {
      this.debugLayoutState();
    }, 2000);
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
    console.log('🐛 ===== DEBUG STOREFRONT PAGE =====');
    console.log('🐛 Layout atual:', this.currentLayout());
    console.log('🐛 Hero visível:', this.showHeroBanner());
    console.log('🐛 Categories visíveis:', this.showCategories());
    console.log('🐛 Tema atual:', this.currentTheme()?.name);
    console.log('🐛 Classes CSS aplicadas:', this.getLayoutClasses());
    console.log('🐛 Classes do grid:', this.getGridClasses());
    console.log('🐛 Layout Service Debug:', this.layoutService.getDebugState());
    console.log('🐛 Produtos carregados:', this.products.length);
    console.log('🐛 ================================');
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
    console.log('🎨 Classes CSS aplicadas:', classes);
    return classes;
  }

  /**
   * Adiciona um produto ao carrinho
   */
  addToCart(product: Product): void {
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

    const existingItem = this.cartItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
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
        summary: 'Adicionado ao Carrinho',
        detail: `${product.name} foi adicionado ao carrinho!`,
        life: 2000
      });
    }

    this.updateCartInfo();
  }
  
  /**
   * Atualiza a contagem de itens e o valor total do carrinho.
   */
  updateCartInfo(): void {
    this.cartItemCount = this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
    this.cartTotalValue = this.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  /**
   * Abre o quick view do produto
   */
  openQuickView(product: Product): void {
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

      const existingItem = this.cartItems.find(item => item.product.id === this.quickViewProduct!.id);

      if (existingItem) {
        existingItem.quantity += this.quickViewQuantity;
      } else {
        this.cartItems.push({ product: this.quickViewProduct!, quantity: this.quickViewQuantity });
      }

      this.updateCartInfo();

      this.messageService.add({
        severity: 'success',
        summary: 'Adicionado ao Carrinho',
        detail: `${this.quickViewProduct.name} foi adicionado ao carrinho!`,
        life: 2500
      });

      this.closeQuickView();
    }
  }

  /**
   * Retorna se o produto tem desconto
   */
  hasDiscount(product: Product): boolean {
    return !!product.oldPrice && product.oldPrice > product.price;
  }

  /**
   * Calcula a porcentagem de desconto
   */
  getDiscountPercentage(product: Product): number {
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
  onProductClick(product: Product): void {
    console.log('Navegando para produto:', product.name);
    // this.router.navigate(['/ecommerce/product', product.id]);
  }

  /**
   * Manipula evento de favoritar produto
   */
  onFavoriteToggle(product: Product): void {
    console.log('Produto favoritado:', product.name);
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
  onCompareProduct(product: Product): void {
    console.log('Produto para comparação:', product.name);
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
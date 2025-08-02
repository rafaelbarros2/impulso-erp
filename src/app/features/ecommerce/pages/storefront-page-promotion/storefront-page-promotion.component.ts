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
import { Router } from '@angular/router';
import { LayoutService, LayoutType } from '../../../../core/services/layout.service';
import { BackgroundConfig, BackgroundService } from '../../../../core/services/background.service';

// Importar nossa interface Product correta
import { BadgeType, Product } from '../../model/product.interface';

// Importar nossos componentes
import { StorefrontItemGridComponent } from '../../components/storefront-item-grid/storefront-item-grid.component';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-storefrontPromotion-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    StorefrontItemGridComponent // Nosso componente integrado
  ],
  providers: [CurrencyPipe, MessageService],
  templateUrl: './storefront-page-promotion.component.html',
  styleUrls: ['./storefront-page-promotion.component.scss']
})
export class StorefrontPagePromotionComponent implements OnInit, OnDestroy {

  // Observables para os serviços
  currentTheme$!: Observable<StoreTheme | null>;
  currentLayout$!: Observable<LayoutType>;
  currentBackground$!: Observable<BackgroundConfig | null>;
  heroVisible$!: Observable<boolean>;
  categoriesVisible$!: Observable<boolean>;

  private subscriptions = new Subscription();

  // Produtos usando nossa interface Product CORRETA
  products: Product[] = [
    {
      id: '1',
      name: 'Jaqueta de Couro Clássica',
      description: 'Jaqueta de couro genuíno, perfeita para qualquer ocasião. Design atemporal com detalhes em zíper premium e bolsos funcionais.',
      image: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=1974',
      imageAlt: 'Jaqueta de Couro Clássica',
      price: 1500.00,
      oldPrice: 1800.00, // Produto em promoção
      rating: { average: 4.7, count: 89, stars: 5 },
      badges: [{ type: BadgeType.SALE, label: '-17%' }],
      category: 'Jaquetas',
      inStock: true,
      featured: false
    },
    {
      id: '2',
      name: 'Vestido Florido de Verão',
      description: 'Vestido leve e confortável com estampa floral exclusiva, ideal para o verão. Tecido respirável e corte que valoriza a silhueta.',
      image: 'https://images.unsplash.com/photo-1594938634149-a1b945d8b9f0?auto=format&fit=crop&q=80&w=1974',
      imageAlt: 'Vestido Florido de Verão',
      price: 350.00,
      rating: { average: 4.8, count: 156, stars: 5 },
      badges: [{ type: BadgeType.NEW, label: 'Novo' }],
      category: 'Vestidos',
      inStock: true,
      featured: true
    },
    {
      id: '3',
      name: 'Tênis Esportivo Pro',
      description: 'Tênis de alta performance para corrida e treino. Tecnologia de absorção de impacto e design ergonômico para máximo conforto.',
      image: 'https://images.unsplash.com/photo-1511746313175-103362a4d5e6?auto=format&fit=crop&q=80&w=1974',
      imageAlt: 'Tênis Esportivo Pro',
      price: 890.00,
      oldPrice: 1200.00, // Produto em promoção
      rating: { average: 4.3, count: 67, stars: 4 },
      badges: [
        { type: BadgeType.SALE, label: '-26%' },
        { type: BadgeType.FEATURED, label: 'Destaque' }
      ],
      category: 'Calçados',
      inStock: false, // Fora de estoque
      featured: true
    },
    {
      id: '4',
      name: 'Calça Jeans Slim',
      description: 'Calça jeans com corte slim moderno e versátil. Tecido de alta qualidade com elastano para maior conforto e mobilidade.',
      image: 'https://images.unsplash.com/photo-1518042456381-da9b07127e7d?auto=format&fit=crop&q=80&w=1974',
      imageAlt: 'Calça Jeans Slim',
      price: 280.00,
      rating: { average: 4.5, count: 203, stars: 5 },
      badges: [],
      category: 'Calças',
      inStock: true,
      featured: false
    },
    {
      id: '5',
      name: 'Camiseta Básica de Algodão',
      description: 'Camiseta 100% algodão pré-encolhido, macia e durável. Corte clássico unissex, essencial no guarda-roupa moderno.',
      image: 'https://images.unsplash.com/photo-1581456105315-1a8519c5c2d3?auto=format&fit=crop&q=80&w=1974',
      imageAlt: 'Camiseta Básica de Algodão',
      price: 80.00,
      oldPrice: 120.00, // Produto em promoção
      rating: { average: 4.9, count: 445, stars: 5 },
      badges: [
        { type: BadgeType.NEW, label: 'Novo' },
        { type: BadgeType.SALE, label: '-33%' }
      ],
      category: 'Camisetas',
      inStock: true,
      featured: false
    },
    {
      id: '6',
      name: 'Óculos de Sol Aviador',
      description: 'Óculos de sol estilo aviador clássico com proteção UV 400. Armação resistente e lentes polarizadas de alta qualidade.',
      image: 'https://images.unsplash.com/photo-1577717903265-985472407268?auto=format&fit=crop&q=80&w=1974',
      imageAlt: 'Óculos de Sol Aviador',
      price: 450.00,
      rating: { average: 4.6, count: 78, stars: 5 },
      badges: [{ type: BadgeType.FEATURED, label: 'Destaque' }],
      category: 'Acessórios',
      inStock: true,
      featured: true
    }
  ];

  cartItems: CartItem[] = [];
  cartTotalValue = 0;
  cartItemCount = 0;

  // Estado do Quick View
  showQuickView = false;
  quickViewProduct: Product | null = null;
  quickViewQuantity = 1;

  // Estado do layout
  selectedTheme: StoreTheme | null = null;
  availableThemes: StoreTheme[] = [];
  currentLayout: LayoutType = 'grid'; // Usando nosso LayoutType correto

  // Visibilidade do hero banner
  showHeroBanner = true;

  constructor(
    private themeService: ThemeService,
    private messageService: MessageService,
    private router: Router,
    private layoutService: LayoutService,
    private backgroundService: BackgroundService
  ) {
    this.currentTheme$ = this.themeService.currentTheme$;
    this.currentLayout$ = this.layoutService.currentLayout$;
    this.heroVisible$ = this.layoutService.heroVisible$;
    this.categoriesVisible$ = this.layoutService.categoriesVisible$;
    this.currentBackground$ = this.backgroundService.currentBackground$;
  }

  ngOnInit(): void {
    // Pega a lista de temas disponíveis
    this.availableThemes = this.themeService.getAvailableThemes();

    // Sincroniza o tema selecionado
    this.subscriptions.add(this.themeService.currentTheme$.subscribe(theme => {
      if (theme) {
        this.selectedTheme = theme;
      }
    }));

    // Sincroniza o layout (corrigido para usar 'grid' | 'minimal')
    this.subscriptions.add(this.currentLayout$.subscribe(layout => {
      this.currentLayout = layout;
    }));

    // Sincroniza a visibilidade do banner
    this.subscriptions.add(this.heroVisible$.subscribe(visible => {
      this.showHeroBanner = visible;
    }));

    // Atualiza informações do carrinho inicialmente
    this.updateCartInfo();

    // Mensagem de boas-vindas
    this.showWelcomeMessage();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Retorna as classes CSS para o layout
   */
  getLayoutClasses(): string {
    let classes = this.currentLayout;
    if (!this.showHeroBanner) {
      classes += ' no-hero';
    }
    return classes;
  }

  /**
   * Muda o tema da loja
   */
  onThemeChange(event: any): void {
    const selectedThemeId = event.value.id;
    this.themeService.applyTheme(selectedThemeId);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Tema Alterado',
      detail: `Tema "${event.value.name}" aplicado com sucesso!`,
      life: 3000
    });
  }

  /**
   * Adiciona um produto ao carrinho (CORRIGIDO)
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
        life: 2500
      });
    }

    this.updateCartInfo();
  }

  /**
   * Atualiza informações do carrinho
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
    this.quickViewQuantity = 1;
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
      // Verifica estoque
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
   * Verifica se o produto está fora de estoque (CORRIGIDO)
   */
  isOutOfStock(product: Product): boolean {
    return !product.inStock;
  }

  /**
   * Verifica se produto tem desconto
   */
  hasDiscount(product: Product): boolean {
    return !!product.oldPrice && product.oldPrice > product.price;
  }

  /**
   * Calcula porcentagem de desconto
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
   * Alterna entre os layouts de exibição (CORRIGIDO)
   */
  switchLayout(layout: LayoutType): void {
    this.layoutService.setLayout(layout);
    
    this.messageService.add({
      severity: 'info',
      summary: 'Layout Alterado',
      detail: `Visualização alterada para ${layout === 'grid' ? 'Grade' : 'Minimal'}`,
      life: 2000
    });
  }

  /**
   * Esconde o hero banner para dar foco aos produtos
   */
  hideHeroBanner(): void {
    this.layoutService.setHeroVisible(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Modo Foco',
      detail: 'Navegue pelos produtos com scroll livre!',
      life: 2500
    });
  }

  /**
   * Mostra o hero banner novamente
   */
  showHeroBannerAgain(): void {
    this.layoutService.setHeroVisible(true);
    this.messageService.add({
      severity: 'info',
      summary: 'Banner Restaurado',
      detail: 'Experiência completa ativada novamente!',
      life: 2000
    });
  }

  /**
   * Finalizar compra
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
    
    this.router.navigate(['/ecommerce/cart']);
  }

  // ================== PRODUTOS FILTRADOS ==================

  /**
   * Produtos em promoção (com desconto)
   */
  get promotedProducts(): Product[] {
    return this.products.filter(p => this.hasDiscount(p));
  }

  /**
   * Produtos regulares (sem desconto)
   */
  get regularProducts(): Product[] {
    return this.products.filter(p => !this.hasDiscount(p));
  }

  /**
   * Produtos em destaque
   */
  get featuredProducts(): Product[] {
    return this.products.filter(p => p.featured);
  }

  /**
   * Produtos novos
   */
  get newProducts(): Product[] {
    return this.products.filter(p => 
      p.badges.some(badge => badge.type === BadgeType.NEW)
    );
  }

  // ================== EVENT HANDLERS para nosso grid ==================

  /**
   * Manipula clique no produto
   */
  onProductClick(product: Product): void {
    console.log('Produto clicado:', product.name);
    // Navegar para página do produto
    // this.router.navigate(['/ecommerce/product', product.id]);
  }

  /**
   * Manipula evento de favoritar
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
   * Manipula evento de comparar
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
   * TrackBy function para performance
   */
  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  /**
   * Mensagem de boas-vindas
   */
  private showWelcomeMessage(): void {
    setTimeout(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Bem-vindo à FashionERP Store!',
        detail: 'Confira nossas promoções especiais da semana!',
        life: 4000
      });
    }, 1000);
  }

  onImageError(event: Event): void {
  const img = event.target as HTMLImageElement | null;
  if (img) {
    img.src = 'https://placehold.co/600x400/E0E7FF/3B82F6?text=Produto';
  }
}
}
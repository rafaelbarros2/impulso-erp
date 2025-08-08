import { Component, OnInit, inject, Signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ThemeService } from '../../../../core/services/legacy-theme.service';
import { StoreTheme } from '../../../../core/models';
import { Router } from '@angular/router';
import { LayoutService } from '../../../../core/services/layout.service';
import { LayoutType } from '../../../../core/models';
import { BackgroundService } from '../../../../core/services/background.service';
import { BackgroundConfig } from '../../../../core/models';

// Importar nossa interface Product correta
import { OnlineProduct, Product, BadgeType } from '../../../../core/models';

// Importar nossos componentes
import { StorefrontItemGridComponent } from '../../components/storefront-item-grid/storefront-item-grid.component';

interface CartItem {
  product: OnlineProduct;
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
export class StorefrontPagePromotionComponent implements OnInit {
  
  // Propriedades reativas usando Signals do serviço
  currentTheme: Signal<StoreTheme | null> = inject(ThemeService).currentTheme;
  currentLayout: Signal<LayoutType> = inject(LayoutService).currentLayout;
  showHeroBanner: Signal<boolean> = inject(LayoutService).heroVisible;
  showCategories: Signal<boolean> = inject(LayoutService).categoriesVisible;
  currentBackground: Signal<BackgroundConfig | null> = inject(BackgroundService).currentBackground;


  // TODO: Implementar carregamento real de produtos da API
  // products: Product[] = [
  //   {
  //     id: '1',
  //     name: 'Jaqueta de Couro Clássica',
  //     description: 'Jaqueta de couro genuíno, perfeita para qualquer ocasião. Corte moderno com detalhes em zíper e bolsos laterais. Material de alta qualidade que oferece durabilidade e estilo atemporal.',
  //     image: 'https://primefaces.org/cdn/primeng/images/demo/product/black-watch.jpg',
  //     imageAlt: 'Jaqueta de Couro Clássica',
  //     price: 1500.00,
  //     oldPrice: 1800.00,
  //     discountPercent: 15,
  //     rating: { average: 4.5, count: 58, stars: 5 },
  //     badges: [{ type: BadgeType.SALE, label: '-15%' }],
  //     category: 'Jaquetas',
  //     inStock: true,
  //     featured: true,
  //   },
  //   {
  //     id: '2',
  //     name: 'Vestido Florido de Verão',
  //     description: 'Vestido leve e confortável com estampa floral exclusiva, ideal para o verão. Tecido respirável e corte que valoriza a silhueta. Perfeito para ocasiões casuais e encontros especiais.',
  //     image: 'https://primefaces.org/cdn/primeng/images/demo/product/blue-band.jpg',
  //     imageAlt: 'Vestido Florido de Verão',
  //     price: 350.00,
  //     rating: { average: 4.8, count: 120, stars: 5 },
  //     badges: [{ type: BadgeType.NEW, label: 'Novo' }],
  //     category: 'Vestidos',
  //     inStock: true,
  //     featured: false,
  //   },
  //   {
  //     id: '3',
  //     name: 'Tênis Esportivo Pro',
  //     description: 'Tênis de alta performance para corrida e treino. Tecnologia de absorção de impacto, sola antiderrapante e design ergonômico. Conforto e performance em cada passo.',
  //     image: 'https://primefaces.org/cdn/primeng/images/demo/product/game-controller.jpg',
  //     imageAlt: 'Tênis Esportivo Pro',
  //     price: 890.00,
  //     rating: { average: 4.2, count: 23, stars: 4 },
  //     badges: [],
  //     category: 'Calçados',
  //     inStock: false,
  //     featured: false,
  //   },
  //   {
  //     id: '4',
  //     name: 'Calça Jeans Slim',
  //     description: 'Calça jeans com corte slim moderno e versátil. Tecido de alta qualidade com elastano para maior conforto. Disponível em lavagem stone com acabamento premium.',
  //     image: 'https://primefaces.org/cdn/primeng/images/demo/product/headphones.jpg',
  //     imageAlt: 'Calça Jeans Slim',
  //     price: 280.00,
  //     rating: { average: 4.6, count: 75, stars: 5 },
  //     badges: [],
  //     category: 'Calças',
  //     inStock: true,
  //     featured: false,
  //   },
  //   {
  //     id: '5',
  //     name: 'Camiseta Básica de Algodão',
  //     description: 'Camiseta 100% algodão pré-encolhido, macia e durável. Corte clássico unissex, essencial no guarda-roupa. Disponível em várias cores básicas.',
  //     image: 'https://primefaces.org/cdn/primeng/images/demo/product/iphone-14.jpg',
  //     imageAlt: 'Camiseta Básica de Algodão',
  //     price: 80.00,
  //     rating: { average: 4.9, count: 200, stars: 5 },
  //     badges: [{ type: BadgeType.NEW, label: 'Novo' }],
  //     category: 'Camisetas',
  //     inStock: true,
  //     featured: false,
  //   },
  //   {
  //     id: '6',
  //     name: 'Óculos de Sol Aviador',
  //     description: 'Óculos de sol estilo aviador clássico com proteção UV 400. Armação resistente e lentes polarizadas. Design atemporal que combina com qualquer estilo.',
  //     image: 'https://primefaces.org/cdn/primeng/images/demo/product/sunglasses.jpg',
  //     imageAlt: 'Óculos de Sol Aviador',
  //     price: 450.00,
  //     rating: { average: 4.7, count: 42, stars: 5 },
  //     badges: [{ type: BadgeType.FEATURED, label: 'Destaque' }],
  //     category: 'Acessórios',
  //     inStock: true,
  //     featured: true,
  //   }
  // ];
  products: OnlineProduct[] = []; // Removido dados mockados

  cartItems: CartItem[] = [];
  cartTotalValue = 0;
  cartItemCount = 0;

  // Estado do Quick View
  showQuickView = false;
  quickViewProduct: OnlineProduct | null = null;
  quickViewQuantity = 1;

  // Estado do layout
  selectedTheme: StoreTheme | null = null;
  availableThemes: StoreTheme[] = [];
  
  // Injeção de dependências
  private readonly themeService = inject(ThemeService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly layoutService = inject(LayoutService);
  private readonly backgroundService = inject(BackgroundService);

  constructor() {
    this.availableThemes = this.themeService.getAvailableThemes();
  }

  ngOnInit(): void {
    // Sincroniza o tema selecionado
    this.selectedTheme = this.themeService.currentTheme();

    // Atualiza informações do carrinho inicialmente
    this.updateCartInfo();

    // Mensagem de boas-vindas
    this.showWelcomeMessage();
  }

  /**
   * Retorna as classes CSS para o layout
   */
  getLayoutClasses(): string {
    let classes = this.currentLayout();
    if (!this.showHeroBanner()) {
      classes += ' no-hero';
    }
    return classes;
  }

  /**
   * Muda o tema da loja
   */
  onThemeChange(event: any): void {
    const selectedThemeId = event.value.id;
    this.themeService.setTheme(selectedThemeId);
    
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
  openQuickView(product: OnlineProduct): void {
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
  isOutOfStock(product: OnlineProduct): boolean {
    return !product.inStock;
  }

  /**
   * Verifica se produto tem desconto
   */
  hasDiscount(product: OnlineProduct): boolean {
    return !!product.oldPrice && product.oldPrice > product.price;
  }

  /**
   * Calcula porcentagem de desconto
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
  get promotedProducts(): OnlineProduct[] {
    return this.products.filter(p => this.hasDiscount(p));
  }

  /**
   * Produtos regulares (sem desconto)
   */
  get regularProducts(): OnlineProduct[] {
    return this.products.filter(p => !this.hasDiscount(p));
  }

  /**
   * Produtos em destaque
   */
  get featuredProducts(): OnlineProduct[] {
    return this.products.filter(p => p.featured);
  }

  /**
   * Produtos novos
   */
  get newProducts(): OnlineProduct[] {
    return this.products.filter(p => 
      p.badges && p.badges.some((badge: any) => badge.type === BadgeType.NEW)
    );
  }

  // ================== EVENT HANDLERS para nosso grid ==================

  /**
   * Manipula clique no produto
   */
  onProductClick(product: OnlineProduct): void {
    console.log('Produto clicado:', product.name);
    // Navegar para página do produto
    // this.router.navigate(['/ecommerce/product', product.id]);
  }

  /**
   * Manipula evento de favoritar
   */
  onFavoriteToggle(product: OnlineProduct): void {
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
  onCompareProduct(product: OnlineProduct): void {
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
  trackByProductId(index: number, product: OnlineProduct): string {
    return product.id.toString();
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

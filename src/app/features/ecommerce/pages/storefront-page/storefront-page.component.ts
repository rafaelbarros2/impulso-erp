import { Component, OnInit, inject, Signal } from '@angular/core';
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
  templateUrl: './storefront-page.component.html',
  styleUrls: ['./storefront-page.component.scss']
})
export class StorefrontPageComponent implements OnInit {

  // Propriedades reativas usando Signals do serviço
  currentTheme: Signal<StoreTheme | null> = (inject(ThemeService) as ThemeService).currentTheme;
  currentLayout: Signal<LayoutType> = inject(LayoutService).currentLayout;
  showHeroBanner: Signal<boolean> = inject(LayoutService).heroVisible;
  showCategories: Signal<boolean> = inject(LayoutService).categoriesVisible;

  // Produtos de exemplo com a estrutura CORRETA da nossa interface
products: Product[] = [
  {
    id: '1',
    name: 'Jaqueta de Couro Clássica',
    description: 'Jaqueta de couro genuíno, perfeita para qualquer ocasião. Corte moderno com detalhes em zíper e bolsos laterais. Material de alta qualidade que oferece durabilidade e estilo atemporal.',
    image: 'https://primefaces.org/cdn/primeng/images/demo/product/black-watch.jpg',
    imageAlt: 'Jaqueta de Couro Clássica',
    price: 1500.00,
    oldPrice: 1800.00,
    discountPercent: 15,
    rating: { average: 4.5, count: 58, stars: 5 },
    badges: [{ type: BadgeType.SALE, label: '-15%' }],
    category: 'Jaquetas',
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Vestido Florido de Verão',
    description: 'Vestido leve e confortável com estampa floral exclusiva, ideal para o verão. Tecido respirável e corte que valoriza a silhueta. Perfeito para ocasiões casuais e encontros especiais.',
    image: 'https://primefaces.org/cdn/primeng/images/demo/product/blue-band.jpg',
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
    image: 'https://primefaces.org/cdn/primeng/images/demo/product/game-controller.jpg',
    imageAlt: 'Tênis Esportivo Pro',
    price: 890.00,
    rating: { average: 4.2, count: 23, stars: 4 },
    badges: [],
    category: 'Calçados',
    inStock: false,
    featured: false,
  },
  {
    id: '4',
    name: 'Calça Jeans Slim',
    description: 'Calça jeans com corte slim moderno e versátil. Tecido de alta qualidade com elastano para maior conforto. Disponível em lavagem stone com acabamento premium.',
    image: 'https://primefaces.org/cdn/primeng/images/demo/product/headphones.jpg',
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
    image: 'https://primefaces.org/cdn/primeng/images/demo/product/iphone-14.jpg',
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
    image: 'https://primefaces.org/cdn/primeng/images/demo/product/sunglasses.jpg',
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

  // Injeção de dependências
  private readonly layoutService = inject(LayoutService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly backgroundService = inject(BackgroundService);

  constructor() {}

  ngOnInit(): void {
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
   * Manipula o evento de toggle do hero banner
   */
  onHeroToggle(): void {
    this.layoutService.toggleHero();
  }

  /**
   * Manipula o evento de toggle das categorias
   */
  onCategoriesToggle(): void {
    this.layoutService.toggleCategories();
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
   * Verifica se o produto está fora de estoque
   */
  isOutOfStock(product: Product): boolean {
    return !product.inStock;
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
   * TrackBy function para otimizar performance
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
        detail: 'Explore nossa coleção exclusiva com sistema de temas dinâmicos.',
        life: 4000
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

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { ThemeService } from '../../../../core/services/legacy-theme.service';
import { BackgroundService } from '../../../../core/services/background.service';
import { LayoutService } from '../../../../core/services/layout.service';
import { StoreTheme, BackgroundConfig, LayoutType } from '../../../../core/models';

// Components & Models
import { StorefrontItemCardComponent } from '../storefront-item-card/storefront-item-card.component';
// import { MOCK_PRODUCTS } from '../../mock/roduct-mock.data'; // Comentado: usando apenas dados reais
import { OnlineProduct, Product, BadgeType } from '../../../../core/models';

@Component({
  selector: 'app-storefront-item-grid',
  standalone: true,
  imports: [CommonModule, StorefrontItemCardComponent],
  templateUrl: './storefront-item-grid.component.html',
  styleUrls: ['./storefront-item-grid.component.scss'],
})
export class StorefrontItemGridComponent implements OnInit {
  
  // Injeção de dependências
  private readonly themeService = inject(ThemeService);
  private readonly layoutService = inject(LayoutService);
  private readonly backgroundService = inject(BackgroundService);

  // Inputs
  @Input() products: OnlineProduct[] = []; // Removido MOCK_PRODUCTS
  @Input() loading: boolean = false;
  @Input() showActions: boolean = true;
  @Input() showRating: boolean = true;
  @Input() showDescription: boolean = true;
  @Input() columns: string = 'auto-fill';
  @Input() minCardWidth: string = '320px';

  // Outputs para eventos dos cards
  @Output() productClick = new EventEmitter<OnlineProduct>();
  @Output() addToCart = new EventEmitter<OnlineProduct>();
  @Output() favoriteToggle = new EventEmitter<OnlineProduct>();
  @Output() compareProduct = new EventEmitter<OnlineProduct>();
  @Output() quickView = new EventEmitter<OnlineProduct>();

  // Estados reativos usando Signals
  currentLayout: Signal<LayoutType> = this.layoutService.currentLayout;
  currentTheme: Signal<StoreTheme | null> = this.themeService.currentTheme;
  currentBackground: Signal<BackgroundConfig | null> = this.backgroundService.currentBackground;

  constructor() {}

  ngOnInit(): void {
    // A injeção de dependências e a leitura de Signals
    // não precisam mais de métodos de subscribe ou unsubscribe.
    // A reatividade é gerenciada de forma automática pelo Angular.
    //console.log('Grid inicializado com Signals. Layout atual:', this.currentLayout());
  }

  /**
   * CORREÇÃO: Retorna o layout atual para o StorefrontItemCardComponent
   */
  get productLayoutType(): LayoutType {
    return this.currentLayout();
  }

  /**
   * Retorna classes CSS para o container do grid
   */
  get gridClasses(): string {
    const baseClasses = 'products-grid w-full';
    const layout = this.currentLayout();
    const layoutClass = `layout-${layout}`;
    
    //console.log('🎯 Layout atual no gridClasses:', layout); // Debug
    
    // TailwindCSS classes baseadas no layout
    if (layout === 'grid') {
      return `${baseClasses} ${layoutClass} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8`;
    } else {
      // Layout minimal - grid mais compacto
      return `${baseClasses} ${layoutClass} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6`;
    }
  }

  /**
   * Retorna o estilo CSS customizado para o grid
   */
  get gridStyle(): any {
    const style: any = {};
    
    // Grid template columns customizado se especificado
    if (this.columns !== 'auto-fill') {
      style['grid-template-columns'] = this.columns;
    } else {
      // Usa auto-fill com largura mínima customizada
      style['grid-template-columns'] = `repeat(auto-fill, minmax(${this.minCardWidth}, 1fr))`;
    }
    
    return style;
  }

  /**
   * Verifica se deve mostrar rating baseado no layout
   */
  get shouldShowRating(): boolean {
    return this.showRating && this.currentLayout() === 'grid';
  }

  /**
   * Verifica se deve mostrar descrição baseado no layout
   */
  get shouldShowDescription(): boolean {
    return this.showDescription && this.currentLayout() === 'grid';
  }

  /**
   * Handlers para eventos dos cards
   */
  onProductClick(product: OnlineProduct): void {
    this.productClick.emit(product);
    //console.log('Produto clicado:', product.name);
  }

  onAddToCart(product: OnlineProduct): void {
    this.addToCart.emit(product);
    //console.log('Adicionado ao carrinho:', product.name);
  }

  onFavoriteToggle(product: OnlineProduct): void {
    this.favoriteToggle.emit(product);
    //console.log('Favorito alternado:', product.name);
  }

  onCompareProduct(product: OnlineProduct): void {
    this.compareProduct.emit(product);
    //console.log('Produto para comparação:', product.name);
  }

  onQuickView(product: OnlineProduct): void {
    this.quickView.emit(product);
    //console.log('Visualização rápida:', product.name);
  }

  /**
   * Filtra produtos por categoria (exemplo de funcionalidade adicional)
   */
  getProductsByCategory(category: string): OnlineProduct[] {
    return this.products.filter(product => 
      product.category && product.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Retorna produtos em destaque
   */
  get featuredProducts(): OnlineProduct[] {
    return this.products.filter(product => product.featured);
  }

  /**
   * Retorna produtos em promoção
   */
  get saleProducts(): OnlineProduct[] {
    return this.products.filter(product => product.oldPrice && product.oldPrice > product.price);
  }

  /**
   * Retorna produtos novos
   */
  get newProducts(): OnlineProduct[] {
    return this.products.filter(product => 
      product.badges && product.badges.some((badge: any) => badge.type === BadgeType.NEW)
    );
  }

  /**
   * Força refresh do grid (útil para debugging)
   */
  refreshGrid(): void {
    //console.log('Grid refreshed. Layout atual:', this.currentLayout());
    // Força uma nova renderização
    this.layoutService.setLayout(this.currentLayout());
  }

  /**
   * Retorna informações do estado atual para debug
   */
  getDebugInfo(): any {
    return {
      layout: this.currentLayout(),
      theme: this.currentTheme()?.name,
      productsCount: this.products.length,
      featuredCount: this.featuredProducts.length,
      saleCount: this.saleProducts.length,
      newCount: this.newProducts.length
    };
  }

  /**
   * TrackBy function para otimizar o *ngFor
   */
  trackByProductId(index: number, product: OnlineProduct): string {
    return product.id.toString();
  }

  /**
   * Scroll para o topo da página
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Toggle debug info visibility (para desenvolvimento)
   */
  toggleDebugInfo(): void {
    const debugElement = document.getElementById('gridDebugInfo');
    if (debugElement) {
      debugElement.style.display = debugElement.style.display === 'none' ? 'block' : 'none';
    }
  }
}
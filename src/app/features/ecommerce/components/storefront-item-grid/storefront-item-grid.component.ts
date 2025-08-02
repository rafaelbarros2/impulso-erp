import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services


// Components & Models
import { StorefrontItemCardComponent } from '../storefront-item-card/storefront-item-card.component';
import { MOCK_PRODUCTS } from '../../model/roduct-mock.data';
import { LayoutType, Product } from '../../model/product.interface';
import { StoreTheme, ThemeService } from '../../../../core/services/theme-service.service';
import { BackgroundService } from '../../../../core/services/background.service';
import { LayoutService } from '../../../../core/services/layout.service';


@Component({
  selector: 'app-storefront-item-grid',
  standalone: true,
  imports: [CommonModule, StorefrontItemCardComponent],
  templateUrl: './storefront-item-grid.component.html',
  styleUrls: ['./storefront-item-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StorefrontItemGridComponent implements OnInit, OnDestroy {
  
  // Inputs
  @Input() products: Product[] = MOCK_PRODUCTS;
  @Input() loading: boolean = false;
  @Input() showActions: boolean = true;
  @Input() showRating: boolean = true;
  @Input() showDescription: boolean = true;
  @Input() columns: string = 'auto-fill';
  @Input() minCardWidth: string = '320px';

  // Outputs para eventos dos cards
  @Output() productClick = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() favoriteToggle = new EventEmitter<Product>();
  @Output() compareProduct = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();

  // Estados internos
  currentLayout: LayoutType = LayoutType.GRID;
  currentTheme: StoreTheme | null = null;
  
  // Subject para cleanup
  private destroy$ = new Subject<void>();
  productLayoutType!: LayoutType;

  constructor(
    private themeService: ThemeService,
    private layoutService: LayoutService,
    private backgroundService: BackgroundService
  ) {}

  ngOnInit(): void {
    this.subscribeToServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribe aos observables dos serviços
   */
private subscribeToServices(): void {
  // Combina observables dos serviços
  combineLatest([
    this.layoutService.currentLayout$,
    this.themeService.currentTheme$,
    this.backgroundService.currentBackground$
  ]).pipe(
    takeUntil(this.destroy$)
  ).subscribe(([layout, theme, background]) => {
    this.currentLayout = layout as LayoutType; // Cast para garantir compatibilidade
    this.currentTheme = theme;
    
    // Log para debug
    console.log('Grid atualizado:', {
      layout,
      theme: theme?.name,
      background: background?.name
    });
  });
}

  /**
   * Retorna o layout atual para o StorefrontItemCardComponent
   */
  get currentLayoutForCard(): LayoutType {
    return this.currentLayout;
  }

  /**
   * Retorna classes CSS para o container do grid
   */
  get gridClasses(): string {
    const baseClasses = 'products-grid w-full';
    const layoutClass = `layout-${this.currentLayout}`;
    
    // TailwindCSS classes baseadas no layout
    if (this.currentLayout === 'grid') {
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
    return this.showRating && this.currentLayout === 'grid';
  }

  /**
   * Verifica se deve mostrar descrição baseado no layout
   */
  get shouldShowDescription(): boolean {
    return this.showDescription && this.currentLayout === 'grid';
  }

  /**
   * Handlers para eventos dos cards
   */
  onProductClick(product: Product): void {
    this.productClick.emit(product);
    console.log('Produto clicado:', product.name);
  }

  onAddToCart(product: Product): void {
    this.addToCart.emit(product);
    console.log('Adicionado ao carrinho:', product.name);
    
    // Aqui você pode integrar com um serviço de carrinho
    // this.cartService.addItem(product);
  }

  onFavoriteToggle(product: Product): void {
    this.favoriteToggle.emit(product);
    console.log('Favorito alternado:', product.name);
    
    // Aqui você pode integrar com um serviço de favoritos
    // this.favoritesService.toggle(product.id);
  }

  onCompareProduct(product: Product): void {
    this.compareProduct.emit(product);
    console.log('Produto para comparação:', product.name);
    
    // Aqui você pode integrar com um serviço de comparação
    // this.compareService.addProduct(product);
  }

  onQuickView(product: Product): void {
    this.quickView.emit(product);
    console.log('Visualização rápida:', product.name);
    
    // Aqui você pode abrir um modal/sidebar
    // this.modalService.openQuickView(product);
  }

  /**
   * Filtra produtos por categoria (exemplo de funcionalidade adicional)
   */
  getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Retorna produtos em destaque
   */
  get featuredProducts(): Product[] {
    return this.products.filter(product => product.featured);
  }

  /**
   * Retorna produtos em promoção
   */
  get saleProducts(): Product[] {
    return this.products.filter(product => product.oldPrice && product.oldPrice > product.price);
  }

  /**
   * Retorna produtos novos
   */
  get newProducts(): Product[] {
    return this.products.filter(product => 
      product.badges.some(badge => badge.type === 'new')
    );
  }

  /**
   * Força refresh do grid (útil para debugging)
   */
  refreshGrid(): void {
    console.log('Grid refreshed');
    // Força detecção de mudanças se necessário
  }

  /**
   * Retorna informações do estado atual para debug
   */
  getDebugInfo(): any {
    return {
      layout: this.currentLayout,
      theme: this.currentTheme?.name,
      productsCount: this.products.length,
      featuredCount: this.featuredProducts.length,
      saleCount: this.saleProducts.length,
      newCount: this.newProducts.length
    };
  }

  /**
   * TrackBy function para otimizar o *ngFor
   */
  trackByProductId(index: number, product: Product): string {
    return product.id;
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
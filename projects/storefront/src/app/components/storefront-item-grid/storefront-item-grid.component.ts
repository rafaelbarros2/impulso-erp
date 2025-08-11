import { Component, OnInit, Input, Output, EventEmitter, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorefrontItemCardComponent } from '../storefront-item-card/storefront-item-card.component';
import { ThemeService } from '../../services/theme.service';
import { StorefrontProduct, BadgeType } from '../../models/storefront-product.model';

// Services


@Component({
  selector: 'app-storefront-item-grid',
  standalone: true,
  imports: [CommonModule, StorefrontItemCardComponent],
  templateUrl: './storefront-item-grid.component.html',
  styleUrls: ['./storefront-item-grid.component.scss'],
  styles: [`
    .storefront-item-grid {
      width: 100%;
    }
    
    .products-container {
      display: grid;
      gap: 1.5rem;
    }
    
    .products-container.layout-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    
    .products-container.layout-list {
      grid-template-columns: 1fr;
    }
    
    .loading-container, .empty-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
    }
    
    .loading-spinner {
      width: 3rem;
      height: 3rem;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .debug-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 0.5rem;
    }
    
    .floating-actions {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 50;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .fab-button {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
    }
    
    .fab-button:hover {
      transform: scale(1.1);
    }
  `]
})
export class StorefrontItemGridComponent implements OnInit {
  
  // Injeção de dependências
  private readonly themeService = inject(ThemeService);

  // Inputs
  @Input() products: StorefrontProduct[] = [];
  @Input() loading: boolean = false;
  @Input() showActions: boolean = true;
  @Input() showRating: boolean = true;
  @Input() showDescription: boolean = true;
  @Input() columns: string = 'auto-fill';
  @Input() minCardWidth: string = '320px';
  @Input() layout: 'grid' | 'list' = 'grid';

  // Outputs para eventos dos cards
  @Output() productClick = new EventEmitter<StorefrontProduct>();
  @Output() addToCart = new EventEmitter<StorefrontProduct>();
  @Output() favoriteToggle = new EventEmitter<StorefrontProduct>();
  @Output() compareProduct = new EventEmitter<StorefrontProduct>();
  @Output() quickView = new EventEmitter<StorefrontProduct>();

  constructor() {}

  ngOnInit(): void {
    // Inicialização do componente
  }

  /**
   * Retorna o layout atual para o StorefrontItemCardComponent
   */
  get productLayoutType(): 'grid' | 'list' {
    return this.layout;
  }

  /**
   * Retorna classes CSS para o container do grid
   */
  get gridClasses(): string {
    const baseClasses = 'products-grid';
    const layoutClass = `layout-${this.layout}`;
    
    return `${baseClasses} ${layoutClass}`;
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
    return this.showRating && this.layout === 'grid';
  }

  /**
   * Verifica se deve mostrar descrição baseado no layout
   */
  get shouldShowDescription(): boolean {
    return this.showDescription && this.layout === 'grid';
  }

  /**
   * Handlers para eventos dos cards
   */
  onProductClick(product: StorefrontProduct): void {
    this.productClick.emit(product);
  }

  onAddToCart(product: StorefrontProduct): void {
    this.addToCart.emit(product);
  }

  onFavoriteToggle(product: StorefrontProduct): void {
    this.favoriteToggle.emit(product);
  }

  onCompareProduct(product: StorefrontProduct): void {
    this.compareProduct.emit(product);
  }

  onQuickView(product: StorefrontProduct): void {
    this.quickView.emit(product);
  }

  /**
   * Filtra produtos por categoria (exemplo de funcionalidade adicional)
   */
  getProductsByCategory(category: string): StorefrontProduct[] {
    return this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Retorna produtos em destaque
   */
  get featuredProducts(): StorefrontProduct[] {
    return this.products.filter(product => product.featured);
  }

  /**
   * Retorna produtos em promoção
   */
  get saleProducts(): StorefrontProduct[] {
    return this.products.filter(product => product.oldPrice && product.oldPrice > product.price);
  }

  /**
   * Retorna produtos novos
   */
  get newProducts(): StorefrontProduct[] {
    return this.products.filter(product => 
      product.badges.some(badge => badge.type === BadgeType.NEW)
    );
  }

  /**
   * Força refresh do grid (útil para debugging)
   */
  refreshGrid(): void {
    // Força uma nova renderização
  }

  /**
   * Retorna informações do estado atual para debug
   */
  getDebugInfo(): any {
    return {
      layout: this.layout,
      productsCount: this.products.length,
      featuredCount: this.featuredProducts.length,
      saleCount: this.saleProducts.length,
      newCount: this.newProducts.length
    };
  }

  /**
   * TrackBy function para otimizar o *ngFor
   */
  trackByProductId(index: number, product: StorefrontProduct): string {
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
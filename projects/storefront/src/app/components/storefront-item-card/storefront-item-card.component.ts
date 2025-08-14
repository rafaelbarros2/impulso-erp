import { Component, Input, Output, EventEmitter, inject, Signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorefrontProduct } from '../../models/storefront-product.model';
import { DynamicStylesService } from '../../services/dynamic-styles.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-storefront-item-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-card" 
         [ngClass]="cardClasses"
         [ngStyle]="cardStyles"
         (click)="onProductClick()"
         [attr.data-dynamic-styles]="stylesState().isLoaded">
      
      <!-- Badge Container -->
      <div class="badge-container" *ngIf="product.badges && product.badges.length > 0">
        <span 
          *ngFor="let badge of product.badges" 
          class="badge"
          [ngClass]="'badge-' + badge.type">
          {{ badge.label }}
        </span>
      </div>

      <!-- Product Image -->
      <div class="product-image">
        <img 
          [src]="product.image" 
          [alt]="product.name"
          (error)="onImageError($event)"
          loading="lazy">
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h3 class="product-name">{{ product.name }}</h3>
        
        <p class="product-description" 
           *ngIf="showDescription && product.description">
          {{ product.description }}
        </p>

        <!-- Rating -->
        <div class="product-rating" *ngIf="showRating && product.rating">
          <div class="stars">
            <span *ngFor="let star of getStars()" 
                  class="star" 
                  [ngClass]="star.filled ? 'filled' : 'empty'">
              ★
            </span>
          </div>
          <span class="rating-count">({{ product.rating.count }})</span>
        </div>

        <!-- Price -->
        <div class="product-price">
          <span class="current-price">R$ {{ product.price | number:'1.2-2' }}</span>
          <span class="old-price" *ngIf="product.oldPrice">
            R$ {{ product.oldPrice | number:'1.2-2' }}
          </span>
        </div>

        <!-- Stock Status -->
        <div class="stock-status" [ngClass]="product.inStock ? 'in-stock' : 'out-of-stock'">
          {{ product.inStock ? 'Em estoque' : 'Fora de estoque' }}
        </div>
      </div>

      <!-- Actions -->
      <div class="product-actions" *ngIf="showActions">
        <button type="button" class="btn add-to-cart-btn" 
                (click)="onAddToCart($event)"
                [disabled]="!product.inStock"
                aria-label="Adicionar ao carrinho">
          <i class="pi pi-shopping-cart" aria-hidden="true"></i>
        </button>
        
        <button type="button" class="btn btn-secondary btn-icon wishlist-icon" 
                (click)="onFavoriteToggle($event)"
                aria-label="Favoritar"
                title="Favoritar">
          <i class="pi pi-heart" aria-hidden="true"></i>
        </button>
        
        <button type="button" class="btn btn-secondary btn-icon" 
                (click)="onQuickView($event)"
                aria-label="Visualização rápida"
                title="Visualização rápida">
          <i class="pi pi-eye" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .product-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: all 0.3s;
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .badge-container {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 10;
      display: flex;
      gap: 4px;
    }

    .badge {
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 4px;
    }

    .badge-sale {
      background: #ef4444;
      color: white;
    }

    .badge-new {
      background: #22c55e;
      color: white;
    }

    .badge-featured {
      background: #3b82f6;
      color: white;
    }

    .product-image {
      aspect-ratio: 1;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1 1 auto;
    }

    .product-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-description {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .stars {
      display: flex;
    }

    .star.filled {
      color: #fbbf24;
    }

    .star.empty {
      color: #d1d5db;
    }

    .rating-count {
      font-size: 14px;
      color: #6b7280;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .current-price {
      font-size: 20px;
      font-weight: bold;
      color: #111827;
    }

    .old-price {
      font-size: 14px;
      color: #6b7280;
      text-decoration: line-through;
    }

    .stock-status.in-stock {
      color: #16a34a;
      font-size: 14px;
    }

    .stock-status.out-of-stock {
      color: #dc2626;
      font-size: 14px;
    }

    .product-actions {
      padding: 16px;
      padding-top: 0;
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: auto;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.2s;
      font-size: 14px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    /* Botão primário agora usa cores dinâmicas do sistema de carrinho */
    .btn-primary {
      background: var(--add-to-cart-background, #2563eb);
      color: var(--add-to-cart-color, white);
    }

    .btn-primary:hover {
      background: var(--add-to-cart-hover-background, #1d4ed8);
      color: var(--add-to-cart-hover-color, white);
    }

    .btn-primary:disabled {
      background: var(--add-to-cart-disabled-background, #9ca3af);
      color: var(--add-to-cart-disabled-color, #6b7280);
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .layout-minimal .product-card {
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .layout-minimal .product-info {
      padding: 8px;
    }

    .layout-minimal .product-name {
      font-size: 16px;
    }
    .btn-icon {
      width: 44px;
      height: 44px;
      padding: 0;
      justify-content: center;
      border-radius: 6px;
    }

    .btn .pi {
      font-size: 18px;
      line-height: 1;
    }

    .btn-text {
      display: none;
    }

    /* Show label on wider screens */
    @media (min-width: 480px) {
      .btn-text { display: inline-block; }
    }

    /* Wrap actions on small screens */
    @media (max-width: 480px) {
      .product-actions { flex-wrap: wrap; gap: 6px; }
    }
  `]
})
export class StorefrontItemCardComponent implements OnInit, OnDestroy {
  @Input() product!: StorefrontProduct;
  @Input() layout: 'grid' | 'list' = 'grid';
  @Input() showActions: boolean = true;
  @Input() showRating: boolean = true;
  @Input() showDescription: boolean = true;
  @Input() customStyles: Record<string, string> = {}; // Estilos customizados via input

  @Output() productClick = new EventEmitter<StorefrontProduct>();
  @Output() addToCart = new EventEmitter<StorefrontProduct>();
  @Output() favoriteToggle = new EventEmitter<StorefrontProduct>();
  @Output() quickView = new EventEmitter<StorefrontProduct>();

  private dynamicStylesService = inject(DynamicStylesService);
  private subscription = new Subscription();
  
  // Estado dos estilos dinâmicos
  stylesState = this.dynamicStylesService.state;

  get cardClasses(): string {
    const baseClasses = 'product-card';
    const layoutClass = `layout-${this.layout}`;
    
    // Adicionar classes baseadas no estado dos estilos dinâmicos
    const dynamicClasses = this.getDynamicClasses();
    
    return [baseClasses, layoutClass, ...dynamicClasses].join(' ');
  }

  get cardStyles(): Record<string, string> {
    // Combinar estilos customizados com estilos dinâmicos
    return {
      ...this.customStyles,
      ...this.getDynamicStyles()
    };
  }

  getStars() {
    if (!this.product.rating) return [];
    
    const stars = [];
    const rating = Math.floor(this.product.rating.average);
    
    for (let i = 1; i <= 5; i++) {
      stars.push({ filled: i <= rating });
    }
    
    return stars;
  }

  onProductClick(): void {
    this.productClick.emit(this.product);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onFavoriteToggle(event: Event): void {
    event.stopPropagation();
    this.favoriteToggle.emit(this.product);
  }

  onQuickView(event: Event): void {
    event.stopPropagation();
    this.quickView.emit(this.product);
  }

  ngOnInit(): void {
    // Os signals já fazem o componente re-renderizar automaticamente
    // Não é necessário observar mudanças manualmente
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getDynamicClasses(): string[] {
    const config = this.dynamicStylesService.getCurrentConfig();
    const classes: string[] = [];
    
    if (config?.components?.productCard) {
      // Adicionar classes baseadas na configuração
      if (config.components.productCard.layout?.direction === 'row') {
        classes.push('card-horizontal');
      }
      
      // Adicionar outras classes baseadas na configuração
      const cardConfig = config.components.productCard as any;
      if (cardConfig.variant) {
        classes.push(`card-${cardConfig.variant}`);
      }
    }
    
    return classes;
  }

  private getDynamicStyles(): Record<string, string> {
    const config = this.dynamicStylesService.getCurrentConfig();
    const styles: Record<string, string> = {};
    
    if (config?.components?.productCard) {
      const cardConfig = config.components.productCard as any;
      
      // Aplicar estilos inline específicos se necessário
      if (cardConfig.dynamicBackground) {
        styles['background'] = cardConfig.dynamicBackground;
      }
      
      if (cardConfig.dynamicBorderRadius) {
        styles['border-radius'] = cardConfig.dynamicBorderRadius;
      }
      
      if (cardConfig.dynamicShadow) {
        styles['box-shadow'] = cardConfig.dynamicShadow;
      }
    }
    
    return styles;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Previne loops infinitos verificando se já é uma imagem de fallback
    if (!img.src.includes('data:image') && !img.dataset['fallback']) {
      img.dataset['fallback'] = 'true';
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTAwSDEzNVYxMTBIMTI1VjEwMFoiIGZpbGw9IiM2QjcyODAiLz4KPHA+dGggZD0iTTEwNSAxMjVIMTk1VjEzNUgxMDVWMTI1WiIgZmlsbD0iIzZCNzI4MCIvPgo8cGF0aCBkPSJNMTA1IDE0NUgxNjVWMTU1SDEwNVYxNDVaIiBmaWxsPSIjNkI3MjgwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LXNpemU9IjE0cHgiPkltYWdlbSBuw6NvIGVuY29udHJhZGE8L3RleHQ+Cjwvc3ZnPgo=';
    }
  }
}

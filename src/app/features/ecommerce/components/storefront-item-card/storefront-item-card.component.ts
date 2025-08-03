import { Component, Input, Output, EventEmitter, OnInit, inject, Signal, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, BadgeType } from '../../model/product.interface';
import { LayoutType } from '../../../../core/services/layout.service';

@Component({
  selector: 'app-storefront-item-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-card" 
         [ngClass]="getCardClasses()"
         (click)="onProductClick()">
      
      <!-- Image Container -->
      <div class="product-image-container">
        <img [src]="product.image" 
             [alt]="product.imageAlt || product.name" 
             class="product-image">
        
        <!-- Badges -->
        <div class="product-badges" *ngIf="product.badges && product.badges.length > 0">
          <span *ngFor="let badge of product.badges" 
                [ngClass]="getBadgeClass(badge.type)"
                class="product-badge">
            {{ badge.label }}
          </span>
        </div>
        
        <!-- Product Actions -->
        <div class="product-actions" *ngIf="showActions">
          <button class="action-btn" 
                  [title]="isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
                  (click)="$event.stopPropagation(); onToggleFavorite()"
                  [style.color]="isFavorited ? 'var(--error-color)' : ''">
            <i [class]="favoriteIcon"></i>
          </button>
          
          <button class="action-btn" 
                  title="Comparar produto"
                  (click)="$event.stopPropagation(); onCompare()">
            <i class="pi pi-chart-line"></i>
          </button>
          
          <button class="action-btn" 
                  title="Visualização rápida"
                  (click)="$event.stopPropagation(); onQuickView()">
            <i class="pi pi-eye"></i>
          </button>
        </div>
      </div>
      
      <!-- Product Info -->
      <div class="product-info">
        <!-- Rating - Only show based on layout and settings -->
        <div class="product-rating" 
             *ngIf="shouldShowRating && product.rating">
          <div class="stars">
            <i *ngFor="let star of starArray" 
               [class]="isStarFilled(star) ? 'pi pi-star-fill star' : 'pi pi-star star'">
            </i>
          </div>
          <span class="rating-count">({{ product.rating.count }} avaliações)</span>
        </div>
        
        <!-- Product Name -->
        <h3 class="product-name">{{ product.name }}</h3>
        
        <!-- Description - Only in grid layout and if enabled -->
        <p class="product-description" 
           *ngIf="shouldShowDescription && product.description">
          {{ product.description }}
        </p>
        
        <!-- Price Container -->
        <div class="product-price-container">
          <span class="product-price">{{ formatPrice(product.price) }}</span>
          
          <!-- Old Price and Discount -->
          <ng-container *ngIf="hasDiscount">
            <span class="product-old-price">{{ formatPrice(product.oldPrice!) }}</span>
            <span class="discount-percent">-{{ discountPercentage }}%</span>
          </ng-container>
        </div>
        
        <!-- Add to Cart Button -->
        <button class="add-to-cart-btn"
                [disabled]="!product.inStock || isLoading"
                (click)="$event.stopPropagation(); onAddToCart()">
          <i [class]="addToCartButtonIcon"></i>
          {{ addToCartButtonText }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./storefront-item-card.component.scss']
})
export class StorefrontItemCardComponent implements OnInit {
  @Input() product!: Product;
  @Input() layout: LayoutType = 'grid';
  @Input() showActions: boolean = true;
  @Input() showRating: boolean = true;
  @Input() showDescription: boolean = true;

  @Output() addToCart = new EventEmitter<Product>();
  @Output() favorite = new EventEmitter<Product>();
  @Output() compare = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  @Output() productClick = new EventEmitter<Product>();

  // Estados internos
  isLoading: boolean = false;
  isAdded: boolean = false;
  isFavorited: boolean = false;

  // Enums para template
  LayoutType = this.layout;
  BadgeType = BadgeType;

  // HostBinding para aplicar classes ao componente host
  @HostBinding('class') get hostClasses(): string {
    return `layout-${this.layout}`;
  }

  ngOnInit(): void {
    // Inicializar estados se necessário
    console.log(`Card inicializado para produto ${this.product.name} no layout ${this.layout}`);
  }

  /**
   * Retorna classes CSS para o card baseado no layout
   */
  getCardClasses(): string {
    const baseClasses = 'product-card-base';
    const layoutClass = `product-card-${this.layout}`;
    const stockClass = this.product.inStock ? 'in-stock' : 'out-of-stock';
    const featuredClass = this.product.featured ? 'featured' : '';
    
    return `${baseClasses} ${layoutClass} ${stockClass} ${featuredClass}`.trim();
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
   * Gera array de estrelas para exibição
   */
  get starArray(): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  /**
   * Verifica se estrela deve estar preenchida
   */
  isStarFilled(starIndex: number): boolean {
    return starIndex <= this.product.rating.stars;
  }

  /**
   * Verifica se produto tem desconto
   */
  get hasDiscount(): boolean {
    return !!this.product.oldPrice && this.product.oldPrice > this.product.price;
  }

  /**
   * Calcula porcentagem de desconto
   */
  get discountPercentage(): number {
    if (!this.hasDiscount) return 0;
    return Math.round(((this.product.oldPrice! - this.product.price) / this.product.oldPrice!) * 100);
  }

  /**
   * Retorna classe CSS para badge
   */
  getBadgeClass(badgeType: BadgeType): string {
    const baseClass = 'product-badge';
    switch (badgeType) {
      case BadgeType.NEW:
        return `${baseClass} badge-new`;
      case BadgeType.SALE:
        return `${baseClass} badge-sale`;
      case BadgeType.FEATURED:
        return `${baseClass} badge-featured`;
      default:
        return baseClass;
    }
  }

  /**
   * Adiciona produto ao carrinho
   */
  onAddToCart(): void {
    if (this.isLoading || !this.product.inStock) return;

    this.isLoading = true;
    
    // Simula loading
    setTimeout(() => {
      this.isLoading = false;
      this.isAdded = true;
      this.addToCart.emit(this.product);

      // Reset estado após delay
      setTimeout(() => {
        this.isAdded = false;
      }, 1500);
    }, 1000);
  }

  /**
   * Toggle favorito
   */
  onToggleFavorite(): void {
    this.isFavorited = !this.isFavorited;
    this.favorite.emit(this.product);
  }

  /**
   * Compara produto
   */
  onCompare(): void {
    this.compare.emit(this.product);
  }

  /**
   * Visualização rápida
   */
  onQuickView(): void {
    this.quickView.emit(this.product);
  }

  /**
   * Click no produto
   */
  onProductClick(): void {
    this.productClick.emit(this.product);
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
   * Retorna texto do botão de carrinho
   */
  get addToCartButtonText(): string {
    if (this.isLoading) {
      return 'Adicionando...';
    }
    if (this.isAdded) {
      return 'Adicionado!';
    }
    if (!this.product.inStock) {
      return 'Indisponível';
    }
    
    // Texto baseado no layout
    if (this.layout === 'minimal') {
      return 'Comprar';
    }
    return 'Adicionar ao Carrinho';
  }

  /**
   * Retorna ícone do botão de carrinho
   */
  get addToCartButtonIcon(): string {
    if (this.isLoading) {
      return 'pi pi-spin pi-spinner';
    }
    if (this.isAdded) {
      return 'pi pi-check';
    }
    if (!this.product.inStock) {
      return 'pi pi-times';
    }
    return 'pi pi-shopping-cart';
  }

  /**
   * Retorna ícone de favorito
   */
  get favoriteIcon(): string {
    return this.isFavorited ? 'pi pi-heart-fill' : 'pi pi-heart';
  }
}
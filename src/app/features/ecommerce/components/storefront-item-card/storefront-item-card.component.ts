import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, LayoutType, BadgeType } from '../../model/product.interface';

@Component({
  selector: 'app-storefront-item-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storefront-item-card.component.html',
  styleUrls: ['./storefront-item-card.component.scss']
})
export class StorefrontItemCardComponent implements OnInit {
  @Input() product!: Product;
  @Input() layout: LayoutType = LayoutType.GRID;
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
  LayoutType = LayoutType;
  BadgeType = BadgeType;

  ngOnInit(): void {
    // Inicializar estados se necessário
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
    return 'pi pi-shopping-cart';
  }

  /**
   * Retorna ícone de favorito
   */
  get favoriteIcon(): string {
    return this.isFavorited ? 'pi pi-heart-fill' : 'pi pi-heart';
  }
}
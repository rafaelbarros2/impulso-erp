import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/catalog.models';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-page">
      <div class="breadcrumb">
        <a routerLink="/">Home</a> / 
        <a routerLink="/c/{{ getCategorySlug() }}">Category</a> / 
        <span>{{ product.name }}</span>
      </div>
      
      <div class="product-layout">
        <div class="product-images">
          <div class="main-image">
            <img [src]="selectedImage" [alt]="product.name">
          </div>
          <div class="image-thumbnails" *ngIf="product.images.length > 1">
            <img 
              *ngFor="let image of product.images; let i = index"
              [src]="image" 
              [alt]="product.name + ' image ' + (i+1)"
              [class.active]="selectedImage === image"
              (click)="selectImage(image)">
          </div>
        </div>
        
        <div class="product-details">
          <header class="product-header">
            <h1>{{ product.name }}</h1>
            <div class="product-meta">
              <span class="product-id">SKU: {{ product.id }}</span>
              <span class="stock-status" [class.in-stock]="product.inStock" [class.out-of-stock]="!product.inStock">
                {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
              </span>
            </div>
          </header>

          <div class="pricing">
            <span class="current-price">\${{ product.price }}</span>
            <span class="original-price" *ngIf="product.originalPrice">\${{ product.originalPrice }}</span>
            <span class="discount" *ngIf="getDiscountPercentage() > 0">
              -{{ getDiscountPercentage() }}%
            </span>
          </div>

          <div class="product-description">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="product-attributes" *ngIf="product.attributes.length > 0">
            <h3>Specifications</h3>
            <div class="attributes-list">
              <div class="attribute" *ngFor="let attr of product.attributes">
                <span class="attr-name">{{ attr.name }}:</span>
                <span class="attr-value">{{ attr.value }}</span>
              </div>
            </div>
          </div>

          <div class="product-actions">
            <button class="add-to-cart-btn" [disabled]="!product.inStock">
              {{ product.inStock ? 'Add to Cart' : 'Out of Stock' }}
            </button>
            <button class="wishlist-btn">Add to Wishlist</button>
          </div>
        </div>
      </div>

      <div class="transfer-state-info">
        <h3>🚀 TransferState Active</h3>
        <p>This product data was loaded using TransferState - no HTTP refetch during hydration!</p>
        <div class="debug-info">
          <small>Slug: {{ product.slug }} | Loaded at: {{ getCurrentTime() }}</small>
          <br>
          <small>Created: {{ formatDate(product.createdAt) }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-md);
      font-family: var(--font-family);
    }

    .breadcrumb {
      margin-bottom: var(--spacing-lg);
      font-size: var(--text-sm);
      color: var(--color-textSecondary);
    }

    .breadcrumb a {
      color: var(--color-primary);
      text-decoration: none;
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-2xl);
      margin-bottom: var(--spacing-xl);
    }

    .product-images {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .main-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .image-thumbnails {
      display: flex;
      gap: var(--spacing-sm);
      overflow-x: auto;
    }

    .image-thumbnails img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .image-thumbnails img:hover,
    .image-thumbnails img.active {
      border-color: #3498db;
    }

    .product-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .product-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #777;
    }

    .stock-status {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-weight: 500;
    }

    .in-stock {
      background: #d4edda;
      color: #155724;
    }

    .out-of-stock {
      background: #f8d7da;
      color: #721c24;
    }

    .pricing {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .current-price {
      font-size: 2rem;
      font-weight: bold;
      color: #e74c3c;
    }

    .original-price {
      font-size: 1.2rem;
      color: #999;
      text-decoration: line-through;
    }

    .discount {
      background: #e74c3c;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: bold;
    }

    .product-description,
    .product-attributes {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .product-description h3,
    .product-attributes h3 {
      color: #34495e;
      margin-top: 0;
      margin-bottom: 1rem;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5rem;
    }

    .product-description p {
      color: #555;
      line-height: 1.6;
      margin: 0;
    }

    .attributes-list {
      display: grid;
      gap: 0.5rem;
    }

    .attribute {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .attr-name {
      font-weight: 500;
      color: #2c3e50;
    }

    .attr-value {
      color: #555;
    }

    .product-actions {
      display: flex;
      gap: 1rem;
      margin-top: auto;
    }

    .add-to-cart-btn,
    .wishlist-btn {
      flex: 1;
      padding: 1rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-to-cart-btn {
      background: #3498db;
      color: white;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      background: #2980b9;
      transform: translateY(-1px);
    }

    .add-to-cart-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .wishlist-btn {
      background: transparent;
      color: #3498db;
      border: 2px solid #3498db;
    }

    .wishlist-btn:hover {
      background: #3498db;
      color: white;
    }

    .transfer-state-info {
      margin-top: 3rem;
      padding: 1.5rem;
      background: #e8f5e8;
      border-left: 4px solid #4caf50;
      border-radius: 4px;
    }

    .transfer-state-info h3 {
      color: #2e7d2e;
      margin-top: 0;
    }

    .debug-info {
      margin-top: 0.5rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .product-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .product-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProductComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  
  // Dados resolvidos pelo productResolver
  product: Product = this.route.snapshot.data['product'];
  selectedImage: string = this.product.images[0] || '';

  ngOnInit(): void {
    // Configura SEO para o produto
    const baseUrl = this.getBaseUrl();
    this.seoService.setProductSeo(this.product, baseUrl);
  }

  ngOnDestroy(): void {
    // Limpa SEO tags ao sair da página
    this.seoService.clearSeoTags();
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  getCategorySlug(): string {
    // Em um app real, você teria essa informação no produto
    return 'category';
  }

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://storefront.example.com'; // Fallback para SSR
  }

  getDiscountPercentage(): number {
    if (!this.product.originalPrice || this.product.originalPrice <= this.product.price) {
      return 0;
    }
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
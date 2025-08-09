import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/catalog.models';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="category-page">
      <div class="breadcrumb">
        <a routerLink="/">Home</a> / 
        <span>{{ category.name }}</span>
      </div>
      
      <header class="category-header">
        <div class="category-info">
          <h1>{{ category.name }}</h1>
          <p class="category-description">{{ category.description }}</p>
          <div class="category-meta">
            <span class="product-count">{{ category.products.length }} products</span>
            <span class="category-id">ID: {{ category.id }}</span>
          </div>
        </div>
        <div class="category-image" *ngIf="category.image">
          <img [src]="category.image" [alt]="category.name">
        </div>
      </header>

      <section class="products-grid" *ngIf="category.products.length > 0">
        <h2>Products in {{ category.name }}</h2>
        <div class="products">
          <div class="product-card" *ngFor="let product of category.products">
            <div class="product-image">
              <img [src]="product.images[0]" [alt]="product.name" *ngIf="product.images.length > 0">
            </div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-pricing">
                <span class="price">\${{ product.price }}</span>
                <span class="original-price" *ngIf="product.originalPrice">\${{ product.originalPrice }}</span>
              </div>
              <div class="product-actions">
                <a [routerLink]="['/p', product.slug]" class="view-product-btn">
                  View Details
                </a>
                <span class="stock-status" [class.in-stock]="product.inStock" [class.out-of-stock]="!product.inStock">
                  {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="transfer-state-info">
        <h3>🚀 TransferState Active</h3>
        <p>This category data was loaded using TransferState - no HTTP refetch during hydration!</p>
        <small>Slug: {{ category.slug }} | Loaded at: {{ getCurrentTime() }}</small>
      </div>
    </div>
  `,
  styles: [`
    .category-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-md);
      font-family: var(--font-family);
    }

    .breadcrumb {
      margin-bottom: var(--spacing-md);
      font-size: var(--text-sm);
      color: var(--color-textSecondary);
    }

    .breadcrumb a {
      color: var(--color-primary);
      text-decoration: none;
    }

    .category-header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .category-info h1 {
      color: var(--color-text);
      margin-bottom: var(--spacing-sm);
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
    }

    .category-description {
      color: var(--color-textSecondary);
      line-height: 1.6;
      margin-bottom: var(--spacing-md);
      font-size: var(--text-base);
    }

    .category-meta {
      display: flex;
      gap: var(--spacing-md);
      font-size: var(--text-sm);
      color: var(--color-textSecondary);
    }

    .category-image img {
      width: 200px;
      height: 150px;
      object-fit: cover;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .products-grid h2 {
      color: var(--color-text);
      margin-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--color-primary);
      padding-bottom: var(--spacing-sm);
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
    }

    .products {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .product-card {
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .product-image img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .product-info {
      padding: var(--spacing-md);
    }

    .product-info h3 {
      color: var(--color-text);
      margin-bottom: var(--spacing-sm);
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
    }

    .product-description {
      color: var(--color-textSecondary);
      font-size: var(--text-sm);
      margin-bottom: var(--spacing-md);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-pricing {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .price {
      font-size: var(--text-lg);
      font-weight: var(--font-bold);
      color: var(--color-accent);
    }

    .original-price {
      font-size: var(--text-sm);
      color: var(--color-textSecondary);
      text-decoration: line-through;
    }

    .product-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .view-product-btn {
      background: var(--color-primary);
      color: var(--color-background);
      padding: var(--spacing-sm) var(--spacing-md);
      text-decoration: none;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      transition: background 0.2s;
    }

    .view-product-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .stock-status {
      font-size: var(--text-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-md);
      font-weight: var(--font-medium);
    }

    .in-stock {
      background: var(--color-success);
      color: var(--color-background);
      opacity: 0.8;
    }

    .out-of-stock {
      background: var(--color-error);
      color: var(--color-background);
      opacity: 0.8;
    }

    .transfer-state-info {
      margin-top: var(--spacing-2xl);
      padding: var(--spacing-md);
      background: var(--color-success);
      border-left: 4px solid var(--color-success);
      border-radius: var(--radius-md);
      opacity: 0.9;
    }

    .transfer-state-info h3 {
      color: var(--color-text);
      margin-top: 0;
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
    }

    @media (max-width: 768px) {
      .category-header {
        grid-template-columns: 1fr;
      }
      
      .products {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CategoryComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  
  // Dados resolvidos pelo categoryResolver
  category: Category = this.route.snapshot.data['category'];

  ngOnInit(): void {
    // Configura SEO para a categoria
    const baseUrl = this.getBaseUrl();
    this.seoService.setCategorySeo(this.category, baseUrl);
  }

  ngOnDestroy(): void {
    // Limpa SEO tags ao sair da página
    this.seoService.clearSeoTags();
  }

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://storefront.example.com'; // Fallback para SSR
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }
}
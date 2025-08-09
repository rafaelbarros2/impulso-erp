import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h1>Storefront Home</h1>
      <p>Welcome to our catalog with SSR + TransferState!</p>
      
      <section class="demo-links">
        <h2>Demo Categories & Products</h2>
        <div class="links-grid">
          <div class="category-links">
            <h3>Categories</h3>
            <a routerLink="/c/electronics">Electronics</a>
            <a routerLink="/c/clothing">Clothing</a>
            <a routerLink="/c/books">Books</a>
            <a routerLink="/c/home-garden">Home & Garden</a>
          </div>
          
          <div class="product-links">
            <h3>Products</h3>
            <a routerLink="/p/laptop-gaming">Gaming Laptop</a>
            <a routerLink="/p/smartphone-pro">Smartphone Pro</a>
            <a routerLink="/p/t-shirt-cotton">Cotton T-Shirt</a>
            <a routerLink="/p/coffee-maker">Coffee Maker</a>
          </div>
        </div>
      </section>
      
      <section class="instructions">
        <h2>🔍 Testing TransferState</h2>
        <ol>
          <li>Open DevTools → Network tab</li>
          <li>Click on any category or product link</li>
          <li>Check that no HTTP requests are made for catalog data</li>
          <li>Data comes from TransferState (server-side pre-fetch)</li>
        </ol>
      </section>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--spacing-xl);
    }

    h1 {
      color: var(--color-text);
      text-align: center;
      margin-bottom: var(--spacing-md);
      font-family: var(--font-family);
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
    }

    .demo-links {
      margin: var(--spacing-2xl) 0;
      padding: var(--spacing-xl);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .links-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-xl);
      margin-top: var(--spacing-md);
    }

    .category-links, .product-links {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    h3 {
      color: var(--color-text);
      margin-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--color-primary);
      padding-bottom: var(--spacing-sm);
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
    }

    a {
      color: var(--color-primary);
      text-decoration: none;
      padding: var(--spacing-sm);
      border-radius: var(--radius-md);
      transition: background 0.2s;
      font-size: var(--text-base);
    }

    a:hover {
      background: var(--color-surface);
      text-decoration: underline;
      color: var(--color-primary);
    }

    .instructions {
      background: var(--color-success);
      color: var(--color-text);
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      border-left: 4px solid var(--color-success);
      opacity: 0.9;
    }

    .instructions h2 {
      color: var(--color-text);
      margin-top: 0;
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
    }

    ol {
      margin: var(--spacing-md) 0;
    }

    li {
      margin: var(--spacing-sm) 0;
      color: var(--color-textSecondary);
      font-size: var(--text-base);
    }

    @media (max-width: 768px) {
      .container {
        padding: var(--spacing-md);
      }
      
      .links-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    // Configura SEO para a página inicial
    const baseUrl = this.getBaseUrl();
    
    this.seoService.setSeoConfig({
      title: 'Premium Storefront - Shop the Best Products Online',
      description: 'Discover our extensive catalog of premium products with fast delivery, competitive prices, and excellent customer service. Shop electronics, clothing, books, and more.',
      keywords: 'ecommerce, shopping, premium products, online store, electronics, clothing, books, home garden',
      canonical: baseUrl,
      ogTitle: 'Premium Storefront - Your One-Stop Shopping Destination',
      ogDescription: 'Discover thousands of premium products with fast delivery and competitive prices.',
      ogImage: `${baseUrl}/assets/images/storefront-hero.jpg`,
      ogUrl: baseUrl,
      ogType: 'website',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Premium Storefront',
        'description': 'Premium online shopping destination with thousands of products',
        'url': baseUrl,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Premium Storefront',
          'url': baseUrl
        }
      }
    });
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
}
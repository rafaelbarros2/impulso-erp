import { Injectable, inject, TransferState, makeStateKey } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Category, Product, CatalogResponse } from '../models/catalog.models';

// State keys para TransferState
export const CATEGORY_STATE_KEY = (slug: string) => makeStateKey<Category>(`category-${slug}`);
export const PRODUCT_STATE_KEY = (slug: string) => makeStateKey<Product>(`product-${slug}`);

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);

  // Mock API base URL - em produção seria uma URL real
  private readonly API_BASE = '/api/catalog';

  /**
   * Busca categoria por slug com TransferState
   */
  getCategoryBySlug(slug: string): Observable<Category> {
    const stateKey = CATEGORY_STATE_KEY(slug);
    
    // Verifica se já existe no TransferState
    const cachedCategory = this.transferState.get(stateKey, null);
    if (cachedCategory) {
      // Category loaded from cache
      return of(cachedCategory);
    }

    // Faz requisição HTTP e salva no TransferState
    // Fetching category from API
    return this.http.get<CatalogResponse<Category>>(`${this.API_BASE}/categories/${slug}`)
      .pipe(
        map(response => response.data),
        tap(category => {
          // Salva no TransferState para evitar refetch no cliente
          this.transferState.set(stateKey, category);
          // Category saved to cache
        }),
        catchError(error => {
          console.error(`[CatalogService] Error fetching category '${slug}':`, error);
          // Retorna dados mock em caso de erro
          return of(this.getMockCategory(slug));
        })
      );
  }

  /**
   * Busca produto por slug com TransferState
   */
  getProductBySlug(slug: string): Observable<Product> {
    const stateKey = PRODUCT_STATE_KEY(slug);
    
    // Verifica se já existe no TransferState
    const cachedProduct = this.transferState.get(stateKey, null);
    if (cachedProduct) {
      // Product loaded from cache
      return of(cachedProduct);
    }

    // Faz requisição HTTP e salva no TransferState
    // Fetching product from API
    return this.http.get<CatalogResponse<Product>>(`${this.API_BASE}/products/${slug}`)
      .pipe(
        map(response => response.data),
        tap(product => {
          // Salva no TransferState para evitar refetch no cliente
          this.transferState.set(stateKey, product);
          // Product saved to cache
        }),
        catchError(error => {
          console.error(`[CatalogService] Error fetching product '${slug}':`, error);
          // Retorna dados mock em caso de erro
          return of(this.getMockProduct(slug));
        })
      );
  }

  /**
   * Limpa cache do TransferState (útil para testes)
   */
  clearTransferStateCache(): void {
    // Em produção, você pode implementar lógica mais sofisticada
    // TransferState cache cleared
  }

  // ========================================
  // MOCK DATA (para desenvolvimento/fallback)
  // ========================================

  private getMockCategory(slug: string): Category {
    return {
      id: `cat-${slug}`,
      slug,
      name: `Category ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
      description: `This is a mock category for ${slug}. In production, this would come from your API.`,
      image: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjE1MCIgeT0iMTEwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LXNpemU9IjE2cHgiPkNhdGVnb3J5ICR7c2x1Z308L3RleHQ+Cjwvc3ZnPg==`,
      products: this.getMockProducts(slug),
      subcategories: [],
      createdAt: new Date().toISOString()
    };
  }

  private getMockProduct(slug: string): Product {
    return {
      id: `prod-${slug}`,
      slug,
      name: `Product ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
      description: `This is a mock product for ${slug}. In production, this would come from your API.`,
      price: Math.floor(Math.random() * 500) + 50,
      originalPrice: Math.floor(Math.random() * 200) + 600,
      images: [
        `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIyNSIgeT0iMTUwIiB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0U1RTdFQiIvPgo8dGV4dCB4PSIzMDAiIHk9IjMyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1zaXplPSIxOHB4Ij5Qcm9kdWN0ICR7c2x1Z308L3RleHQ+Cjwvc3ZnPg==`
      ],
      categoryId: 'mock-category',
      inStock: Math.random() > 0.2, // 80% chance in stock
      attributes: [
        { name: 'Brand', value: 'Mock Brand' },
        { name: 'Color', value: 'Blue' },
        { name: 'Size', value: 'Medium' }
      ],
      createdAt: new Date().toISOString()
    };
  }

  private getMockProducts(categorySlug: string): Product[] {
    const productCount = Math.floor(Math.random() * 8) + 3; // 3-10 products
    return Array.from({ length: productCount }, (_, i) => ({
      id: `${categorySlug}-prod-${i}`,
      slug: `${categorySlug}-product-${i}`,
      name: `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Product ${i + 1}`,
      description: `Mock product ${i + 1} in category ${categorySlug}`,
      price: Math.floor(Math.random() * 300) + 20,
      images: [`data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjExMiIgeT0iNzUiIHdpZHRoPSI3NSIgaGVpZ2h0PSI1MCIgZmlsbD0iI0U1RTdFQiIvPgo8dGV4dCB4PSIxNTAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1zaXplPSIxMnB4Ij4ke2NhdGVnb3J5U2x1Z30gUHJvZHVjdCR7aSArIDF9PC90ZXh0Pjwvc3ZnPg==`],
      categoryId: `cat-${categorySlug}`,
      inStock: Math.random() > 0.15,
      attributes: [
        { name: 'Brand', value: 'Mock Brand' },
        { name: 'SKU', value: `SKU-${categorySlug.toUpperCase()}-${i}` }
      ],
      createdAt: new Date().toISOString()
    }));
  }
}
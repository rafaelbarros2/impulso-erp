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
      console.log(`[CatalogService] Category '${slug}' loaded from TransferState (no HTTP request)`);
      return of(cachedCategory);
    }

    // Faz requisição HTTP e salva no TransferState
    console.log(`[CatalogService] Fetching category '${slug}' from API`);
    return this.http.get<CatalogResponse<Category>>(`${this.API_BASE}/categories/${slug}`)
      .pipe(
        map(response => response.data),
        tap(category => {
          // Salva no TransferState para evitar refetch no cliente
          this.transferState.set(stateKey, category);
          console.log(`[CatalogService] Category '${slug}' saved to TransferState`);
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
      console.log(`[CatalogService] Product '${slug}' loaded from TransferState (no HTTP request)`);
      return of(cachedProduct);
    }

    // Faz requisição HTTP e salva no TransferState
    console.log(`[CatalogService] Fetching product '${slug}' from API`);
    return this.http.get<CatalogResponse<Product>>(`${this.API_BASE}/products/${slug}`)
      .pipe(
        map(response => response.data),
        tap(product => {
          // Salva no TransferState para evitar refetch no cliente
          this.transferState.set(stateKey, product);
          console.log(`[CatalogService] Product '${slug}' saved to TransferState`);
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
    console.log('[CatalogService] TransferState cache cleared');
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
      image: `https://picsum.photos/400/300?random=${slug}`,
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
        `https://picsum.photos/600/400?random=${slug}-1`,
        `https://picsum.photos/600/400?random=${slug}-2`
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
      images: [`https://picsum.photos/300/200?random=${categorySlug}-${i}`],
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
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
    const name = slug.charAt(0).toUpperCase() + slug.slice(1);
    const curated = this.getCuratedProducts(slug);
    return {
      id: `cat-${slug}`,
      slug,
      name: `Category ${name}`,
      description: `Mock de produtos para ${slug}.`,
      image: `https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?q=80&auto=format&fit=crop&w=800`,
      products: curated.length ? curated : this.getMockProducts(slug),
      subcategories: [],
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Lista produtos (mock) opcionalmente filtrando por categoria slug.
   * Em produção, chamaria uma API real.
   */
  listProducts(categorySlug?: string): Observable<Product[]> {
    try {
      if (categorySlug) {
        const curated = this.getCuratedProducts(categorySlug);
        return of(curated.length ? curated : this.getMockProducts(categorySlug));
      }
      // Flat list combinando categorias conhecidas
      const all = [
        ...this.getCuratedProducts('demo'),
        ...this.getCuratedProducts('vestidos'),
        ...this.getCuratedProducts('calcados'),
        ...this.getCuratedProducts('blusas'),
      ];
      return of(all.length ? all : this.getMockProducts('all'));
    } catch (e) {
      console.error('[CatalogService] listProducts fallback:', e);
      return of(this.getMockProducts('all'));
    }
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

  // Curated demo products with real images (for better visual testing)
  private getCuratedProducts(slug: string): Product[] {
    const now = new Date().toISOString();
    const common: Pick<Product, 'categoryId' | 'inStock' | 'createdAt'> = {
      categoryId: `cat-${slug}`,
      inStock: true,
      createdAt: now
    };

    const bySlug: Record<string, Product[]> = {
      demo: [
        {
          id: `${slug}-1`, slug: `${slug}-vestido-floral`, name: 'Vestido Floral Verão',
          description: 'Leve, confortável e perfeito para o verão.',
          price: 129.9, originalPrice: 259.9,
          images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'vermelho,azul' },
            { name: 'Sizes', value: 'P,M,G' },
          ],
          ...common
        },
        {
          id: `${slug}-2`, slug: `${slug}-tenis-esportivo`, name: 'Tênis Esportivo Premium',
          description: 'Amortecimento e performance para o dia a dia.',
          price: 189.9, originalPrice: 269.9,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'preto,branco' },
            { name: 'Sizes', value: '38,39,40' },
          ],
          ...common
        },
        {
          id: `${slug}-3`, slug: `${slug}-blusa-cropped`, name: 'Blusa Cropped Básica',
          description: 'Corta-vento para compor looks despojados.',
          price: 49.9,
          images: ['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'branco,preto,rosa' },
            { name: 'Sizes', value: 'PP,P,M' },
          ],
          ...common
        },
        {
          id: `${slug}-4`, slug: `${slug}-jaqueta-couro`, name: 'Jaqueta de Couro Sintético',
          description: 'Estilo e resistência em qualquer estação.',
          price: 299.9, originalPrice: 399.9,
          images: ['https://images.unsplash.com/photo-1520975682031-ae4f074e6f36?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'preto,marrom' },
            { name: 'Sizes', value: 'P,M,G,GG' },
          ],
          ...common
        },
        {
          id: `${slug}-5`, slug: `${slug}-calca-jeans`, name: 'Calça Jeans Skinny',
          description: 'Modelagem moderna e tecido confortável.',
          price: 159.9,
          images: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'azul,preto' },
            { name: 'Sizes', value: 'P,M,G,GG' },
          ],
          ...common
        }
      ],
      vestidos: [
        {
          id: `${slug}-6`, slug: `${slug}-mid-verde`, name: 'Vestido Midi Verde',
          description: 'Elegante e versátil para eventos.',
          price: 219.9, originalPrice: 289.9,
          images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'verde' },
            { name: 'Sizes', value: 'P,M,G' },
          ],
          ...common
        },
        {
          id: `${slug}-7`, slug: `${slug}-longo-listrado`, name: 'Vestido Longo Listrado',
          description: 'Look leve com caimento perfeito.',
          price: 199.9,
          images: ['https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'preto,branco' },
            { name: 'Sizes', value: 'M,G,GG' },
          ],
          ...common
        }
      ],
      calcados: [
        {
          id: `${slug}-8`, slug: `${slug}-tenis-corrida`, name: 'Tênis de Corrida Pro',
          description: 'Leve e respirável para treinos intensos.',
          price: 279.9, originalPrice: 349.9,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'preto,branco' },
            { name: 'Sizes', value: '38,39,40,41' },
          ],
          ...common
        },
        {
          id: `${slug}-9`, slug: `${slug}-bota-cano-curto`, name: 'Bota Cano Curto',
          description: 'Acabamento premium e solado confortável.',
          price: 329.9,
          images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'marrom,preto' },
            { name: 'Sizes', value: '37,38,39,40' },
          ],
          ...common
        }
      ],
      blusas: [
        {
          id: `${slug}-10`, slug: `${slug}-camisa-linho`, name: 'Camisa de Linho',
          description: 'Frescor e elegância no mesmo item.',
          price: 139.9,
          images: ['https://images.unsplash.com/photo-1520975682031-ae4f074e6f36?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'branco,bege' },
            { name: 'Sizes', value: 'P,M,G' },
          ],
          ...common
        },
        {
          id: `${slug}-11`, slug: `${slug}-moletom-basic`, name: 'Moletom Basic',
          description: 'Conforto para dias frios.',
          price: 189.9,
          images: ['https://images.unsplash.com/photo-1520975682031-ae4f074e6f36?q=80&w=800&auto=format&fit=crop'],
          attributes: [
            { name: 'Brand', value: 'Demo' },
            { name: 'Colors', value: 'cinza,preto' },
            { name: 'Sizes', value: 'M,G,GG' },
          ],
          ...common
        }
      ]
    };

    return bySlug[slug] || [];
  }
}

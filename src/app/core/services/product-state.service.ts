import { Injectable, signal, computed } from '@angular/core';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  sku: string;
  category?: string;
  priceCost: number;
  priceSale: number;
  stockQuantity: number;
  minStock: number;
  imageUrl?: string;
  active?: boolean;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  totalProducts: number;
  currentPage: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductStateService {
  private state = signal<ProductState>({
    products: [],
    loading: false,
    error: null,
    selectedProduct: null,
    totalProducts: 0,
    currentPage: 0,
    pageSize: 10
  });

  // Computed signals for reactive access
  readonly products = computed(() => this.state().products);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly selectedProduct = computed(() => this.state().selectedProduct);
  readonly totalProducts = computed(() => this.state().totalProducts);
  readonly currentPage = computed(() => this.state().currentPage);
  readonly pageSize = computed(() => this.state().pageSize);
  readonly hasProducts = computed(() => this.state().products.length > 0);
  readonly isEmpty = computed(() => this.state().products.length === 0 && !this.state().loading);
  readonly totalPages = computed(() => Math.ceil(this.state().totalProducts / this.state().pageSize));

  // Computed signals for product statistics
  readonly lowStockProducts = computed(() => 
    this.products().filter(product => product.stockQuantity <= product.minStock)
  );
  readonly outOfStockProducts = computed(() => 
    this.products().filter(product => product.stockQuantity === 0)
  );
  readonly totalStockValue = computed(() => 
    this.products().reduce((total, product) => total + (product.priceCost * product.stockQuantity), 0)
  );

  // Actions to update state
  setLoading(loading: boolean): void {
    this.state.update(state => ({ ...state, loading }));
  }

  setError(error: string | null): void {
    this.state.update(state => ({ ...state, error, loading: false }));
  }

  clearError(): void {
    this.state.update(state => ({ ...state, error: null }));
  }

  setProducts(products: Product[], totalCount?: number, page?: number): void {
    this.state.update(state => ({
      ...state,
      products,
      totalProducts: totalCount ?? products.length,
      currentPage: page ?? state.currentPage,
      loading: false,
      error: null
    }));
  }

  addProduct(product: Product): void {
    this.state.update(state => ({
      ...state,
      products: [...state.products, product],
      totalProducts: state.totalProducts + 1
    }));
  }

  updateProduct(updatedProduct: Product): void {
    this.state.update(state => ({
      ...state,
      products: state.products.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      ),
      selectedProduct: state.selectedProduct?.id === updatedProduct.id 
        ? updatedProduct 
        : state.selectedProduct
    }));
  }

  removeProduct(productId: number): void {
    this.state.update(state => ({
      ...state,
      products: state.products.filter(product => product.id !== productId),
      totalProducts: Math.max(0, state.totalProducts - 1),
      selectedProduct: state.selectedProduct?.id === productId 
        ? null 
        : state.selectedProduct
    }));
  }

  selectProduct(product: Product | null): void {
    this.state.update(state => ({ ...state, selectedProduct: product }));
  }

  setPage(page: number): void {
    this.state.update(state => ({ ...state, currentPage: page }));
  }

  setPageSize(pageSize: number): void {
    this.state.update(state => ({ ...state, pageSize, currentPage: 0 }));
  }

  reset(): void {
    this.state.set({
      products: [],
      loading: false,
      error: null,
      selectedProduct: null,
      totalProducts: 0,
      currentPage: 0,
      pageSize: 10
    });
  }

  // Filter products by search term
  getFilteredProducts(searchTerm: string = '') {
    return computed(() => {
      const products = this.products();
      if (!searchTerm.trim()) {
        return products;
      }
      
      const term = searchTerm.toLowerCase();
      return products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term)
      );
    });
  }

  // Filter products by category
  getProductsByCategory(category: string) {
    return computed(() => 
      this.products().filter(product => product.category === category)
    );
  }

  // Get product by ID
  getProductById(id: number) {
    return computed(() => 
      this.products().find(product => product.id === id) || null
    );
  }

  // Get product by SKU
  getProductBySku(sku: string) {
    return computed(() => 
      this.products().find(product => product.sku === sku) || null
    );
  }
}
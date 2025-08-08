import { Injectable, computed, signal } from '@angular/core';
import { StateManagerService } from './state-manager.service';
import { BaseStateService } from './base-state.service';
import { 
  ProductState, 
  DEFAULT_PRODUCT_STATE,
  Product, 
  ProductFilters 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductStateService extends BaseStateService<ProductState> {
  protected state = signal<ProductState>({
    loading: false,
    error: null,
    lastUpdated: null,
    products: [],
    selectedProduct: null,
    totalProducts: 0,
    filters: {
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 0,
      inStock: false,
      active: true
    },
    currentPage: 0,
    pageSize: 10
  });

  constructor(private stateManager: StateManagerService) {
    super();
  }

  // Computed signals
  readonly products = computed(() => this.state().products);
  readonly selectedProduct = computed(() => this.state().selectedProduct);
  readonly totalProducts = computed(() => this.state().totalProducts);
  readonly filters = computed(() => this.state().filters);
  readonly currentPage = computed(() => this.state().currentPage);
  readonly pageSize = computed(() => this.state().pageSize);
  readonly hasProducts = computed(() => this.state().products.length > 0);
  readonly isEmpty = computed(() => this.state().products.length === 0 && !this.state().loading);
  readonly totalPages = computed(() => Math.ceil(this.state().totalProducts / this.state().pageSize));

  // Filtered products
  readonly filteredProducts = computed(() => {
    const products = this.products();
    const filters = this.filters();
    
    return products.filter(product => {
      const matchesSearch = !filters.search || 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.sku.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.category?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = !filters.category || 
        product.category === filters.category;
      
      const matchesPrice = (!filters.minPrice || product.priceSale >= filters.minPrice) &&
        (!filters.maxPrice || product.priceSale <= filters.maxPrice);
      
      const matchesStock = !filters.inStock || product.stockQuantity > 0;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });
  });

  // Statistics
  readonly lowStockProducts = computed(() => 
    this.products().filter(product => product.stockQuantity <= product.minStock)
  );
  
  readonly outOfStockProducts = computed(() => 
    this.products().filter(product => product.stockQuantity === 0)
  );
  
  readonly totalStockValue = computed(() => 
    this.products().reduce((total, product) => total + (product.priceCost * product.stockQuantity), 0)
  );
  
  readonly categories = computed(() => {
    const categories = new Set(this.products().map(p => p.category).filter(Boolean));
    return Array.from(categories);
  });

  // Actions
  async loadProducts(): Promise<void> {
    this.setLoading(true);
    
    try {
      // Simulate API call - replace with actual service call
      setTimeout(() => {
        const mockProducts: Product[] = [
          {
            id: 1,
            name: 'Produto Exemplo 1',
            description: 'Descrição do produto 1',
            sku: 'PRD001',
            category: 'Eletrônicos',
            priceCost: 50,
            priceSale: 100,
            stockQuantity: 10,
            minStock: 5,
            active: true
          },
          {
            id: 2,
            name: 'Produto Exemplo 2',
            description: 'Descrição do produto 2',
            sku: 'PRD002',
            category: 'Acessórios',
            priceCost: 20,
            priceSale: 40,
            stockQuantity: 15,
            minStock: 10,
            active: true
          }
        ];

        this.setProducts(mockProducts);
      }, 500);
    } catch (error) {
      this.setError('Erro ao carregar produtos');
    } finally {
      this.setLoading(false);
    }
  }

  setProducts(products: Product[]): void {
    this.state.update(state => ({
      ...state,
      products,
      totalProducts: products.length,
      loading: false,
      error: null,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setProducts(products);
  }

  addProduct(product: Product): void {
    this.state.update(state => ({
      ...state,
      products: [...state.products, { ...product, id: Date.now() }],
      totalProducts: state.totalProducts + 1,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setProducts(this.state().products);
  }

  updateProduct(updatedProduct: Product): void {
    this.state.update(state => ({
      ...state,
      products: state.products.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      ),
      selectedProduct: state.selectedProduct?.id === updatedProduct.id 
        ? updatedProduct 
        : state.selectedProduct,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setProducts(this.state().products);
  }

  removeProduct(productId: number): void {
    this.state.update(state => ({
      ...state,
      products: state.products.filter(product => product.id !== productId),
      totalProducts: Math.max(0, state.totalProducts - 1),
      selectedProduct: state.selectedProduct?.id === productId 
        ? null 
        : state.selectedProduct,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setProducts(this.state().products);
  }

  selectProduct(product: Product | null): void {
    this.state.update(state => ({
      ...state,
      selectedProduct: product,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setSelectedProduct(product);
  }

  setFilters(filters: Partial<ProductFilters>): void {
    this.state.update(state => ({
      ...state,
      filters: { ...state.filters, ...filters },
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setProductFilters(filters);
  }

  setPage(page: number): void {
    this.state.update(state => ({
      ...state,
      currentPage: page,
      lastUpdated: new Date()
    }));
  }

  setPageSize(pageSize: number): void {
    this.state.update(state => ({
      ...state,
      pageSize,
      currentPage: 0,
      lastUpdated: new Date()
    }));
  }

  getProductById(id: number): Product | null {
    return this.products().find(product => product.id === id) || null;
  }

  getProductBySku(sku: string): Product | null {
    return this.products().find(product => product.sku === sku) || null;
  }

  getProductsByCategory(category: string): Product[] {
    return this.products().filter(product => product.category === category);
  }

  searchProducts(term: string): void {
    this.setFilters({ search: term });
  }

  reset(): void {
    this.state.set({
      loading: false,
      error: null,
      lastUpdated: null,
      products: [],
      selectedProduct: null,
      totalProducts: 0,
      filters: {
        search: '',
        category: '',
        minPrice: 0,
        maxPrice: 0,
        inStock: false,
        active: true
      },
      currentPage: 0,
      pageSize: 10
    });
  }

  getStateSnapshot(): ProductState {
    return this.state();
  }
}
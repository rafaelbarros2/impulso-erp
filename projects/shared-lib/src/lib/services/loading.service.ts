import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadingState } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = signal<LoadingState>({});
  private globalLoading = signal<boolean>(false);

  // Computed signals for reactive access
  readonly loadingStates$ = computed(() => this.loadingStates());
  readonly globalLoading$ = computed(() => this.globalLoading());

  constructor() {}

  /**
   * Get the current loading states for all keys
   */
  getLoadingStates() {
    return this.loadingStates$;
  }

  /**
   * Get the loading state for a specific key
   */
  getLoadingState(key: string) {
    return computed(() => !!this.loadingStates()[key]);
  }

  /**
   * Get the global loading state
   */
  getGlobalLoading() {
    return this.globalLoading$;
  }

  /**
   * Set loading state for a specific key
   */
  setLoading(key: string, loading: boolean): void {
    this.loadingStates.update(currentStates => {
      const newStates = { ...currentStates, [key]: loading };
      // Remove key if loading is false to keep state clean
      if (!loading) {
        delete newStates[key];
      }
      this.updateGlobalLoading(newStates);
      return newStates;
    });
  }

  /**
   * Set global loading state
   */
  setGlobalLoading(loading: boolean): void {
    this.globalLoading.set(loading);
  }

  /**
   * Check if any specific loading state is active
   */
  isLoading(key: string): boolean {
    return !!this.loadingStates()[key];
  }

  /**
   * Check if global loading is active
   */
  isGlobalLoading(): boolean {
    return this.globalLoading();
  }

  /**
   * Check if any loading state is active
   */
  isAnyLoading(): boolean {
    const states = this.loadingStates();
    return Object.keys(states).some(key => states[key]) || this.globalLoading();
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this.loadingStates.set({});
    this.globalLoading.set(false);
  }

  /**
   * Clear loading state for a specific key
   */
  clearLoading(key: string): void {
    this.setLoading(key, false);
  }

  /**
   * Start loading for a key and return a function to stop it
   */
  startLoading(key: string): () => void {
    this.setLoading(key, true);
    return () => this.setLoading(key, false);
  }

  /**
   * Execute an async operation with loading state
   */
  async withLoading<T>(key: string, operation: () => Promise<T>): Promise<T> {
    try {
      this.setLoading(key, true);
      const result = await operation();
      return result;
    } finally {
      this.setLoading(key, false);
    }
  }

  /**
   * Execute an observable operation with loading state
   */
  withLoadingObservable<T>(key: string, operation: () => Observable<T>): Observable<T> {
    return new Observable(observer => {
      this.setLoading(key, true);
      
      const subscription = operation().subscribe({
        next: (value) => observer.next(value),
        error: (error) => {
          this.setLoading(key, false);
          observer.error(error);
        },
        complete: () => {
          this.setLoading(key, false);
          observer.complete();
        }
      });

      return () => {
        this.setLoading(key, false);
        subscription.unsubscribe();
      };
    });
  }

  private updateGlobalLoading(states: LoadingState): void {
    const hasAnyLoading = Object.keys(states).some(key => states[key]);
    // Only update global loading if it's not manually set
    if (!this.globalLoading() && hasAnyLoading) {
      // Don't auto-set global loading, let components decide
    }
  }

  // Predefined loading keys for common operations
  static readonly KEYS = {
    // General operations
    GLOBAL: 'global',
    INITIAL_LOAD: 'initial-load',
    
    // Data loading
    PRODUCTS: 'products',
    PRODUCT_DETAILS: 'product-details',
    CLIENTS: 'clients',
    CLIENT_DETAILS: 'client-details',
    ORDERS: 'orders',
    ORDER_DETAILS: 'order-details',
    DASHBOARD: 'dashboard',
    
    // CRUD operations
    CREATING_PRODUCT: 'creating-product',
    UPDATING_PRODUCT: 'updating-product',
    DELETING_PRODUCT: 'deleting-product',
    CREATING_CLIENT: 'creating-client',
    UPDATING_CLIENT: 'updating-client',
    DELETING_CLIENT: 'deleting-client',
    
    // Authentication
    LOGIN: 'login',
    LOGOUT: 'logout',
    
    // Forms
    FORM_SUBMIT: 'form-submit',
    
    // Search and filters
    SEARCH: 'search',
    FILTER: 'filter',
    
    // File operations
    UPLOAD: 'upload',
    DOWNLOAD: 'download',
    
    // Cart operations
    ADD_TO_CART: 'add-to-cart',
    UPDATE_CART: 'update-cart',
    REMOVE_FROM_CART: 'remove-from-cart',
    
    // Checkout
    CHECKOUT: 'checkout',
    PAYMENT: 'payment'
  } as const;
}
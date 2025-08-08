import { Injectable, computed, signal } from '@angular/core';
import { StateManagerService } from './state-manager.service';
import { BaseStateService } from './base-state.service';
import { 
  CartState, 
  DEFAULT_CART_STATE,
  CartItem, 
  AppliedDiscount 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartStateService extends BaseStateService<CartState> {
  protected state = signal<CartState>({
    loading: false,
    error: null,
    lastUpdated: null,
    items: [],
    subtotal: 0,
    discountAmount: 0,
    total: 0,
    itemCount: 0,
    isOpen: false
  });

  constructor(private stateManager: StateManagerService) {
    super();
  }

  // Computed signals
  readonly items = computed(() => this.state().items);
  readonly subtotal = computed(() => this.state().subtotal);
  readonly discountAmount = computed(() => this.state().discountAmount);
  readonly total = computed(() => this.state().total);
  readonly itemCount = computed(() => this.state().itemCount);
  readonly isOpen = computed(() => this.state().isOpen);
  readonly appliedDiscount = computed(() => this.state().appliedDiscount);
  readonly isEmpty = computed(() => this.state().items.length === 0);
  readonly hasDiscount = computed(() => this.state().appliedDiscount !== undefined);

  // Actions
  addToCart(item: Omit<CartItem, 'id'>): void {
    this.state.update(state => {
      const existingItem = state.items.find(i => i.productId === item.productId);
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = state.items.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...state.items, { ...item, id: Date.now() }];
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        lastUpdated: new Date()
      };
    });

    // Update global state
    this.stateManager.addToCart(item as CartItem);
  }

  updateItemQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    this.state.update(state => {
      const newItems = state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        lastUpdated: new Date()
      };
    });

    // Update global state
    this.stateManager.setCart(this.state());
  }

  removeItem(itemId: number): void {
    this.state.update(state => {
      const newItems = state.items.filter(item => item.id !== itemId);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        lastUpdated: new Date()
      };
    });

    // Update global state
    this.stateManager.setCart(this.state());
  }

  clearCart(): void {
    this.state.update(state => ({
      ...state,
      items: [],
      total: 0,
      itemCount: 0,
      appliedDiscount: undefined,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.clearCart();
  }

  toggleCart(): void {
    this.state.update(state => ({
      ...state,
      isOpen: !state.isOpen,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.toggleCart();
  }

  openCart(): void {
    this.state.update(state => ({
      ...state,
      isOpen: true,
      lastUpdated: new Date()
    }));
  }

  closeCart(): void {
    this.state.update(state => ({
      ...state,
      isOpen: false,
      lastUpdated: new Date()
    }));
  }

  applyDiscount(code: string, amount: number, type: 'percentage' | 'fixed'): void {
    this.state.update(state => ({
      ...state,
      appliedDiscount: { code, amount, type },
      lastUpdated: new Date()
    }));
  }

  removeDiscount(): void {
    this.state.update(state => ({
      ...state,
      appliedDiscount: undefined,
      lastUpdated: new Date()
    }));
  }

  getItemById(itemId: number): CartItem | null {
    return this.items().find(item => item.id === itemId) || null;
  }

  getItemByProductId(productId: number): CartItem | null {
    return this.items().find(item => item.productId === productId) || null;
  }

  getItemsCount(): number {
    return this.itemCount();
  }

  getSubtotal(): number {
    return this.items().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  async checkout(checkoutData: any): Promise<void> {
    this.setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear cart after successful checkout
      this.clearCart();
      
      this.state.update(state => ({
        ...state,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }));
    } catch (error) {
      this.setError('Erro ao finalizar compra');
    } finally {
      this.setLoading(false);
    }
  }

  reset(): void {
    this.state.set({
      loading: false,
      error: null,
      lastUpdated: null,
      items: [],
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      itemCount: 0,
      isOpen: false
    });
  }

  getStateSnapshot(): CartState {
    return this.state();
  }
}
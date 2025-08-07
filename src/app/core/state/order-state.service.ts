import { Injectable, computed, signal } from '@angular/core';
import { StateManagerService } from './state-manager.service';
import { BaseStateService } from './base-state.service';
import { 
  OrderState, 
  OrderFilters, 
  OrderStats,
  DEFAULT_ORDER_STATE,
  Order,
  OrderItem
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderStateService extends BaseStateService<OrderState> {
  protected state = signal<OrderState>({
    loading: false,
    error: null,
    lastUpdated: null,
    orders: [],
    selectedOrder: null,
    totalOrders: 0,
    filters: {
      status: '',
      dateRange: {
        start: null,
        end: null
      },
      client: '',
      paymentStatus: ''
    },
    currentPage: 0,
    pageSize: 10
  });

  constructor(private stateManager: StateManagerService) {
    super();
  }

  // Computed signals
  readonly orders = computed(() => this.state().orders);
  readonly selectedOrder = computed(() => this.state().selectedOrder);
  readonly totalOrders = computed(() => this.state().totalOrders);
  readonly filters = computed(() => this.state().filters);
  readonly currentPage = computed(() => this.state().currentPage);
  readonly pageSize = computed(() => this.state().pageSize);
  readonly hasOrders = computed(() => this.state().orders.length > 0);
  readonly isEmpty = computed(() => this.state().orders.length === 0 && !this.state().loading);
  readonly totalPages = computed(() => Math.ceil(this.state().totalOrders / this.state().pageSize));

  // Filtered orders
  readonly filteredOrders = computed(() => {
    const orders = this.orders();
    const filters = this.filters();
    
    return orders.filter(order => {
      const matchesStatus = !filters.status || order.status === filters.status;
      const matchesPaymentStatus = !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;
      const matchesClient = !filters.client || 
        order.clientName.toLowerCase().includes(filters.client.toLowerCase());
      
      const matchesDateRange = (!filters.dateRange.start || order.createdAt >= filters.dateRange.start) &&
        (!filters.dateRange.end || order.createdAt <= filters.dateRange.end);
      
      return matchesStatus && matchesPaymentStatus && matchesClient && matchesDateRange;
    });
  });

  // Statistics
  readonly ordersByStatus = computed(() => {
    const statusCounts = new Map<string, number>();
    this.orders().forEach(order => {
      statusCounts.set(order.status, (statusCounts.get(order.status) || 0) + 1);
    });
    return statusCounts;
  });

  readonly totalRevenue = computed(() => 
    this.orders().reduce((sum, order) => sum + order.total, 0)
  );

  readonly averageOrderValue = computed(() => {
    const orders = this.orders();
    if (orders.length === 0) return 0;
    return this.totalRevenue() / orders.length;
  });

  // Actions
  async loadOrders(): Promise<void> {
    this.setLoading(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        const mockOrders: Order[] = [
          {
            id: 1,
            orderNumber: 'ORD-001',
            clientId: 1,
            clientName: 'João Silva',
            items: [
              {
                id: 1,
                productId: 1,
                productName: 'Produto Exemplo 1',
                quantity: 2,
                unitPrice: 100,
                totalPrice: 200
              }
            ],
            subtotal: 200,
            discount: 0,
            total: 200,
            status: 'delivered',
            paymentMethod: 'credit_card',
            paymentStatus: 'paid',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
          },
          {
            id: 2,
            orderNumber: 'ORD-002',
            clientId: 2,
            clientName: 'Maria Santos',
            items: [
              {
                id: 2,
                productId: 2,
                productName: 'Produto Exemplo 2',
                quantity: 1,
                unitPrice: 40,
                totalPrice: 40
              }
            ],
            subtotal: 40,
            discount: 0,
            total: 40,
            status: 'pending',
            paymentMethod: 'cash',
            paymentStatus: 'pending',
            createdAt: new Date('2024-01-16'),
            updatedAt: new Date('2024-01-16')
          }
        ];

        this.setOrders(mockOrders);
      }, 500);
    } catch (error) {
      this.setError('Erro ao carregar pedidos');
    } finally {
      this.setLoading(false);
    }
  }

  setOrders(orders: Order[]): void {
    this.state.update(state => ({
      ...state,
      orders,
      totalOrders: orders.length,
      loading: false,
      error: null,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setOrders(orders);
  }

  addOrder(order: Order): void {
    this.state.update(state => ({
      ...state,
      orders: [...state.orders, { ...order, id: Date.now() }],
      totalOrders: state.totalOrders + 1,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setOrders(this.state().orders);
  }

  updateOrder(updatedOrder: Order): void {
    this.state.update(state => ({
      ...state,
      orders: state.orders.map(order => 
        order.id === updatedOrder.id ? { ...updatedOrder, updatedAt: new Date() } : order
      ),
      selectedOrder: state.selectedOrder?.id === updatedOrder.id 
        ? updatedOrder 
        : state.selectedOrder,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setOrders(this.state().orders);
  }

  updateOrderStatus(orderId: number, status: Order['status']): void {
    this.state.update(state => ({
      ...state,
      orders: state.orders.map(order =>
        order.id === orderId 
          ? { ...order, status, updatedAt: new Date() }
          : order
      ),
      selectedOrder: state.selectedOrder?.id === orderId
        ? { ...state.selectedOrder, status, updatedAt: new Date() }
        : state.selectedOrder,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setOrders(this.state().orders);
  }

  removeOrder(orderId: number): void {
    this.state.update(state => ({
      ...state,
      orders: state.orders.filter(order => order.id !== orderId),
      totalOrders: Math.max(0, state.totalOrders - 1),
      selectedOrder: state.selectedOrder?.id === orderId 
        ? null 
        : state.selectedOrder,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setOrders(this.state().orders);
  }

  selectOrder(order: Order | null): void {
    this.state.update(state => ({
      ...state,
      selectedOrder: order,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setSelectedOrder(order);
  }

  setFilters(filters: Partial<OrderFilters>): void {
    this.state.update(state => ({
      ...state,
      filters: { ...state.filters, ...filters },
      lastUpdated: new Date()
    }));
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

  getOrderById(id: number): Order | null {
    return this.orders().find(order => order.id === id) || null;
  }

  getOrderByNumber(orderNumber: string): Order | null {
    return this.orders().find(order => order.orderNumber === orderNumber) || null;
  }

  getOrdersByStatus(status: string): Order[] {
    return this.orders().filter(order => order.status === status);
  }

  getOrdersByClientId(clientId: number): Order[] {
    return this.orders().filter(order => order.clientId === clientId);
  }

  searchOrders(term: string): void {
    this.setFilters({ client: term });
  }

  reset(): void {
    this.state.set({
      loading: false,
      error: null,
      lastUpdated: null,
      orders: [],
      selectedOrder: null,
      totalOrders: 0,
      filters: {
        status: '',
        dateRange: {
          start: null,
          end: null
        },
        client: '',
        paymentStatus: ''
      },
      currentPage: 0,
      pageSize: 10
    });
  }

  getStateSnapshot(): OrderState {
    return this.state();
  }
}
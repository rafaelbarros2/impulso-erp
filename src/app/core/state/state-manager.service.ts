import { Injectable, signal, computed } from '@angular/core';
import { 
  AppState,
  AuthState,
  CartState,
  FinanceState,
  UIState,
  ProductFilters,
  FinancialReport,
  ClientFilters,
  CartItem
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class StateManagerService {
  private state = signal<AppState>({
    auth: {
      loading: false,
      error: null,
      lastUpdated: null,
      isAuthenticated: false,
      user: null,
      token: null,
      permissions: [],
      roles: []
    },
    clients: {
      clients: [],
      selectedClient: null,
      totalClients: 0,
      filters: {
        search: '',
        category: '',
        status: 'all' as const
      },
      currentPage: 0,
      pageSize: 10,
      loading: false,
      error: null,
      lastUpdated: null
    },
    products: {
      products: [],
      selectedProduct: null,
      totalProducts: 0,
      filters: {
        search: '',
        category: '',
        minPrice: 0,
        maxPrice: 0,
        inStock: false
      },
      categories: [],
      currentPage: 0,
      pageSize: 10,
      loading: false,
      error: null,
      lastUpdated: null
    },
    cart: {
      items: [],
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      itemCount: 0,
      isOpen: false,
      taxAmount: 0,
      loading: false,
      error: null,
      lastUpdated: null
    },
    orders: {
      orders: [],
      selectedOrder: null,
      totalOrders: 0,
      filters: {
        status: 'all' as const,
        dateRange: {
          start: null,
          end: null
        },
        clientId: undefined
      },
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {
          pending: 0,
          confirmed: 0,
          preparing: 0,
          ready: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          refunded: 0
        },
        ordersByPaymentStatus: {
          pending: 0,
          paid: 0,
          refunded: 0,
          failed: 0
        },
        ordersBySource: {},
        monthlyRevenue: [],
        topProducts: [],
        topClients: []
      },
      currentPage: 0,
      pageSize: 10,
      loading: false,
      error: null,
      lastUpdated: null
    },
    finance: {
      payables: [],
      receivables: [],
      reports: [],
      summary: {
        totalReceivables: 0,
        totalPayables: 0,
        balance: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        overdueReceivables: 0,
        overduePayables: 0,
        pendingReceivables: 0,
        pendingPayables: 0,
        projectedRevenue: 0,
        projectedExpenses: 0
      },
      filters: {
        dateRange: {
          start: null,
          end: null
        },
        status: 'all' as const,
        type: 'all' as const
      },
      currentPage: 0,
      pageSize: 10,
      loading: false,
      error: null,
      lastUpdated: null
    },
    ui: {
      theme: 'light',
      sidebar: {
        isOpen: true,
        isCollapsed: false
      },
      loading: false,
      loadingState: {
        global: false,
        components: {}
      },
      notifications: [],
      modals: {},
      preferences: {
        language: 'pt-BR',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        numberFormat: 'pt-BR',
        theme: 'light',
        sidebar: {
          defaultOpen: true,
          defaultCollapsed: false
        },
        notifications: {
          enabled: true,
          sound: false,
          desktop: false,
          autoClose: true,
          defaultDuration: 3000
        },
        table: {
          defaultPageSize: 10,
          denseMode: false,
          showBorders: true
        }
      },
      layout: {
        header: { fixed: true, height: 64 },
        sidebar: { fixed: true, width: 256, collapsedWidth: 64 },
        footer: { fixed: false, height: 48 },
        content: { padding: 16 }
      },
      error: null,
      lastUpdated: null
    }
  });

  // Auth state
  readonly auth = computed(() => this.state().auth);
  readonly isAuthenticated = computed(() => this.state().auth.isAuthenticated);
  readonly user = computed(() => this.state().auth.user);
  readonly permissions = computed(() => this.state().auth.permissions);

  // Client state
  readonly clients = computed(() => this.state().clients);
  readonly selectedClient = computed(() => this.state().clients.selectedClient);

  // Product state
  readonly products = computed(() => this.state().products);
  readonly selectedProduct = computed(() => this.state().products.selectedProduct);

  // Cart state
  readonly cart = computed(() => this.state().cart);
  readonly cartItems = computed(() => this.state().cart.items);
  readonly cartTotal = computed(() => this.state().cart.total);

  // Order state
  readonly orders = computed(() => this.state().orders);
  readonly selectedOrder = computed(() => this.state().orders.selectedOrder);

  // Finance state
  readonly finance = computed(() => this.state().finance);
  readonly financeSummary = computed(() => this.state().finance.summary);

  // UI state
  readonly ui = computed(() => this.state().ui);
  readonly theme = computed(() => this.state().ui.theme);
  readonly sidebar = computed(() => this.state().ui.sidebar);
  readonly notifications = computed(() => this.state().ui.notifications);

  // Auth actions
  setAuth(auth: Partial<AuthState>): void {
    this.state.update(state => ({
      ...state,
      auth: { ...state.auth, ...auth }
    }));
  }

  login(user: any, token: string, permissions: string[]): void {
    this.setAuth({
      isAuthenticated: true,
      user,
      token,
      permissions
    });
  }

  logout(): void {
    this.setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
      permissions: []
    });
  }

  // Client actions
  setClients(clients: any[]): void {
    this.state.update(state => ({
      ...state,
      clients: {
        ...state.clients,
        clients,
        totalClients: clients.length
      }
    }));
  }

  setSelectedClient(client: any | null): void {
    this.state.update(state => ({
      ...state,
      clients: {
        ...state.clients,
        selectedClient: client
      }
    }));
  }

  setClientFilters(filters: Partial<ClientFilters>): void {
    this.state.update(state => ({
      ...state,
      clients: {
        ...state.clients,
        filters: { ...state.clients.filters, ...filters }
      }
    }));
  }

  // Product actions
  setProducts(products: any[]): void {
    this.state.update(state => ({
      ...state,
      products: {
        ...state.products,
        products,
        totalProducts: products.length
      }
    }));
  }

  setSelectedProduct(product: any | null): void {
    this.state.update(state => ({
      ...state,
      products: {
        ...state.products,
        selectedProduct: product
      }
    }));
  }

  setProductFilters(filters: Partial<ProductFilters>): void {
    this.state.update(state => ({
      ...state,
      products: {
        ...state.products,
        filters: { ...state.products.filters, ...filters }
      }
    }));
  }

  // Cart actions
  setCart(cart: Partial<CartState>): void {
    this.state.update(state => ({
      ...state,
      cart: { ...state.cart, ...cart }
    }));
  }

  addToCart(item: CartItem): void {
    this.state.update(state => {
      const existingItem = state.cart.items.find(i => i.productId === item.productId);
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = state.cart.items.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...state.cart.items, item];
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          total,
          itemCount
        }
      };
    });
  }

  removeFromCart(productId: number): void {
    this.state.update(state => {
      const newItems = state.cart.items.filter(item => item.productId !== productId);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          total,
          itemCount
        }
      };
    });
  }

  clearCart(): void {
    this.setCart({
      items: [],
      total: 0,
      itemCount: 0
    });
  }

  toggleCart(): void {
    this.state.update(state => ({
      ...state,
      cart: {
        ...state.cart,
        isOpen: !state.cart.isOpen
      }
    }));
  }

  // Order actions
  setOrders(orders: any[]): void {
    this.state.update(state => ({
      ...state,
      orders: {
        ...state.orders,
        orders,
        totalOrders: orders.length
      }
    }));
  }

  setSelectedOrder(order: any | null): void {
    this.state.update(state => ({
      ...state,
      orders: {
        ...state.orders,
        selectedOrder: order
      }
    }));
  }

  // Finance actions
  setFinance(finance: Partial<FinanceState>): void {
    this.state.update(state => ({
      ...state,
      finance: { ...state.finance, ...finance }
    }));
  }

  // UI actions
  setTheme(theme: 'light' | 'dark'): void {
    this.state.update(state => ({
      ...state,
      ui: {
        ...state.ui,
        theme
      }
    }));
  }

  setSidebar(sidebar: Partial<UIState['sidebar']>): void {
    this.state.update(state => ({
      ...state,
      ui: {
        ...state.ui,
        sidebar: { ...state.ui.sidebar, ...sidebar }
      }
    }));
  }

  setLoading(component: string, loading: boolean): void {
    this.state.update(state => ({
      ...state,
      ui: {
        ...state.ui,
        loadingState: {
          ...state.ui.loadingState,
          components: {
            ...state.ui.loadingState.components,
            [component]: loading
          }
        }
      }
    }));
  }

  setGlobalLoading(loading: boolean): void {
    this.state.update(state => ({
      ...state,
      ui: {
        ...state.ui,
        loadingState: {
          ...state.ui.loadingState,
          global: loading
        }
      }
    }));
  }

  addNotification(notification: any): void {
    this.state.update(state => ({
      ...state,
      ui: {
        ...state.ui,
        notifications: [
          ...state.ui.notifications,
          {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            read: false
          }
        ]
      }
    }));
  }

  removeNotification(id: string): void {
    this.state.update(state => ({
      ...state,
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter(n => n.id !== id)
      }
    }));
  }

  markNotificationAsRead(id: string): void {
    this.state.update(state => ({
      ...state,
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      }
    }));
  }

  // Utility methods
  getStateSnapshot(): AppState {
    return this.state();
  }

  reset(): void {
    this.state.set({
      auth: {
        loading: false,
        error: null,
        lastUpdated: null,
        isAuthenticated: false,
        user: null,
        token: null,
        permissions: [],
        roles: []
      },
      clients: {
        clients: [],
        selectedClient: null,
        totalClients: 0,
        filters: {
          search: '',
          category: '',
          status: 'all' as const
        },
        currentPage: 0,
        pageSize: 10,
        loading: false,
        error: null,
        lastUpdated: null
      },
      products: {
        products: [],
        selectedProduct: null,
        totalProducts: 0,
        filters: {
          search: '',
          category: '',
          minPrice: 0,
          maxPrice: 0,
          inStock: false
        },
        categories: [],
        currentPage: 0,
        pageSize: 10,
        loading: false,
        error: null,
        lastUpdated: null
      },
      cart: {
        items: [],
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        itemCount: 0,
        isOpen: false,
        taxAmount: 0,
        loading: false,
        error: null,
        lastUpdated: null
      },
      orders: {
        orders: [],
        selectedOrder: null,
        totalOrders: 0,
        filters: {
          status: 'all' as const,
          dateRange: {
            start: null,
            end: null
          },
          clientId: undefined
        },
        stats: {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          ordersByStatus: {
            pending: 0,
            confirmed: 0,
            preparing: 0,
            ready: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            refunded: 0
          },
          ordersByPaymentStatus: {
            pending: 0,
            paid: 0,
            refunded: 0,
            failed: 0
          },
          ordersBySource: {},
          monthlyRevenue: [],
          topProducts: [],
          topClients: []
        },
        currentPage: 0,
        pageSize: 10,
        loading: false,
        error: null,
        lastUpdated: null
      },
      finance: {
        payables: [],
        receivables: [],
        reports: [],
        summary: {
          totalReceivables: 0,
          totalPayables: 0,
          balance: 0,
          monthlyRevenue: 0,
          monthlyExpenses: 0,
          overdueReceivables: 0,
          overduePayables: 0,
          pendingReceivables: 0,
          pendingPayables: 0,
          projectedRevenue: 0,
          projectedExpenses: 0
        },
        filters: {
          dateRange: {
            start: null,
            end: null
          },
          status: 'all' as const,
          type: 'all' as const
        },
        currentPage: 0,
        pageSize: 10,
        loading: false,
        error: null,
        lastUpdated: null
      },
      ui: {
        theme: 'light',
        sidebar: {
          isOpen: true,
          isCollapsed: false
        },
        loading: false,
        loadingState: {
          global: false,
          components: {}
        },
        notifications: [],
        modals: {},
        preferences: {
          language: 'pt-BR',
          dateFormat: 'DD/MM/YYYY',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          numberFormat: 'pt-BR',
          theme: 'light',
          sidebar: {
            defaultOpen: true,
            defaultCollapsed: false
          },
          notifications: {
            enabled: true,
            sound: false,
            desktop: false,
            autoClose: true,
            defaultDuration: 3000
          },
          table: {
            defaultPageSize: 10,
            denseMode: false,
            showBorders: true
          }
        },
        layout: {
          header: { fixed: true, height: 64 },
          sidebar: { fixed: true, width: 256, collapsedWidth: 64 },
          footer: { fixed: false, height: 48 },
          content: { padding: 16 }
        },
        error: null,
        lastUpdated: null
      }
    });
  }
}
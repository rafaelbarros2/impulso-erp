// State management models - centralized interfaces for all application states
// Import existing models that are already defined
import { 
  User, 
  Client, 
  Product, 
  CartItem, 
  Order, 
  Payable, 
  Receivable, 
  Notification, 
  ThemeMode,
  ClientFilters,
  ProductFilters,
  OrderFilters,
  OrderStats,
  FinanceFilters,
  FinanceSummary,
  FinancialReport,
  UIPreferences,
  LayoutSettings,
  AppliedDiscount,
  Role
} from './index';

// Base state interface
export interface BaseState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Authentication state
export interface AuthState extends BaseState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  permissions: string[];
  roles: Role[];
}

// Client management state  
export interface ClientState extends BaseState {
  clients: Client[];
  selectedClient: Client | null;
  totalClients: number;
  filters: ClientFilters;
  currentPage: number;
  pageSize: number;
}

// Product management state
export interface ProductState extends BaseState {
  products: Product[];
  selectedProduct: Product | null;
  totalProducts: number;
  filters: ProductFilters;
  categories: string[];
  currentPage: number;
  pageSize: number;
}

// Cart state
export interface CartState extends BaseState {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  itemCount: number;
  isOpen: boolean;
  appliedDiscount?: AppliedDiscount;
  expiresAt?: Date;
}

// Order management state
export interface OrderState extends BaseState {
  orders: Order[];
  selectedOrder: Order | null;
  totalOrders: number;
  filters: OrderFilters;
  stats: OrderStats;
  currentPage: number;
  pageSize: number;
}

// Finance state
export interface FinanceState extends BaseState {
  payables: Payable[];
  receivables: Receivable[];
  summary: FinanceSummary;
  reports: FinancialReport[];
  filters: FinanceFilters;
  currentPage: number;
  pageSize: number;
}

// UI state - reuse existing UIState from ui.model.ts but extend with BaseState
export interface UIStateExtended extends BaseState {
  theme: ThemeMode;
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  loadingState: {  // renamed to avoid conflict with BaseState.loading
    global: boolean;
    components: Record<string, boolean>;
  };
  notifications: Notification[];
  modals: Record<string, boolean>;
  preferences: UIPreferences;
  layout: LayoutSettings;
}

// App-wide state interface
export interface AppState {
  auth: AuthState;
  clients: ClientState;
  products: ProductState;
  cart: CartState;
  orders: OrderState;
  finance: FinanceState;
  ui: UIStateExtended;
}

// State update actions
export type StateAction<T = any> = {
  type: string;
  payload?: T;
  meta?: any;
};

// Common state operations
export interface StateOperations<T extends BaseState> {
  setState: (state: Partial<T>) => void;
  resetState: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateLastUpdated: () => void;
}

// Default states
export const DEFAULT_BASE_STATE: BaseState = {
  loading: false,
  error: null,
  lastUpdated: null
};

export const DEFAULT_AUTH_STATE: AuthState = {
  ...DEFAULT_BASE_STATE,
  isAuthenticated: false,
  user: null,
  token: null,
  permissions: [],
  roles: []
};

export const DEFAULT_CLIENT_STATE: ClientState = {
  ...DEFAULT_BASE_STATE,
  clients: [],
  selectedClient: null,
  totalClients: 0,
  filters: {},
  currentPage: 1,
  pageSize: 10
};

export const DEFAULT_PRODUCT_STATE: ProductState = {
  ...DEFAULT_BASE_STATE,
  products: [],
  selectedProduct: null,
  totalProducts: 0,
  filters: {},
  categories: [],
  currentPage: 1,
  pageSize: 10
};

export const DEFAULT_CART_STATE: CartState = {
  ...DEFAULT_BASE_STATE,
  items: [],
  subtotal: 0,
  discountAmount: 0,
  taxAmount: 0,
  total: 0,
  itemCount: 0,
  isOpen: false
};

export const DEFAULT_ORDER_STATE: OrderState = {
  ...DEFAULT_BASE_STATE,
  orders: [],
  selectedOrder: null,
  totalOrders: 0,
  filters: {},
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
      failed: 0,
      refunded: 0
    },
    ordersBySource: {},
    monthlyRevenue: [],
    topProducts: [],
    topClients: []
  },
  currentPage: 1,
  pageSize: 10
};

export const DEFAULT_FINANCE_STATE: FinanceState = {
  ...DEFAULT_BASE_STATE,
  payables: [],
  receivables: [],
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
  reports: [],
  filters: {},
  currentPage: 1,
  pageSize: 10
};

export const DEFAULT_UI_STATE_EXTENDED: UIStateExtended = {
  ...DEFAULT_BASE_STATE,
  theme: 'light',
  sidebar: {
    isOpen: true,
    isCollapsed: false
  },
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
      sound: true,
      desktop: true,
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
    header: {
      fixed: true,
      height: 64
    },
    sidebar: {
      fixed: true,
      width: 280,
      collapsedWidth: 80
    },
    footer: {
      fixed: false,
      height: 48
    },
    content: {
      padding: 24
    }
  }
};

export const DEFAULT_APP_STATE: AppState = {
  auth: DEFAULT_AUTH_STATE,
  clients: DEFAULT_CLIENT_STATE,
  products: DEFAULT_PRODUCT_STATE,
  cart: DEFAULT_CART_STATE,
  orders: DEFAULT_ORDER_STATE,
  finance: DEFAULT_FINANCE_STATE,
  ui: DEFAULT_UI_STATE_EXTENDED
};
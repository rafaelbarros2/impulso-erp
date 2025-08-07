// Dashboard models
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  size: 'small' | 'medium' | 'large' | 'full';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  data: any;
  config: any;
  visible: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  sharedWith?: string[];
}

// Report models
export interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'sales' | 'inventory' | 'finance' | 'customers' | 'custom';
  category: string;
  config: ReportConfig;
  lastGenerated?: Date;
  schedule?: ReportSchedule;
  createdBy: string;
  sharedWith?: string[];
}

export interface ReportConfig {
  dataSource: string;
  filters: Record<string, any>;
  groupBy?: string[];
  aggregations: Array<{
    field: string;
    operation: 'sum' | 'avg' | 'count' | 'min' | 'max';
    alias?: string;
  }>;
  sortBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  limit?: number;
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

export interface ReportGeneration {
  id: string;
  reportId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generatedAt?: Date;
  completedAt?: Date;
  fileUrl?: string;
  fileSize?: number;
  error?: string;
  requestedBy: string;
}

// Settings models
export interface CompanySettings {
  id: string;
  name: string;
  taxId: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  logo?: string;
  settings: {
    currency: string;
    language: string;
    timezone: string;
    dateFormat: string;
    fiscalYearStart: string; // MM-DD
    inventoryMethod: 'fifo' | 'lifo' | 'weighted_average';
  };
}

export interface SystemSettings {
  id: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expireDays: number;
    };
    twoFactorAuth: boolean;
    loginAttempts: number;
  };
  integrations: Array<{
    name: string;
    type: string;
    enabled: boolean;
    config: Record<string, any>;
  }>;
  backup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number;
    lastBackup?: Date;
  };
}

// Import/Export models
export interface ImportJob {
  id: string;
  type: 'products' | 'clients' | 'orders' | 'payables' | 'receivables';
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors?: ImportError[];
  startedAt?: Date;
  completedAt?: Date;
  requestedBy: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export interface ExportJob {
  id: string;
  type: 'products' | 'clients' | 'orders' | 'payables' | 'receivables' | 'reports';
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  startedAt?: Date;
  completedAt?: Date;
  requestedBy: string;
}

// Search models
export interface SearchResult {
  id: string;
  type: 'product' | 'client' | 'order' | 'payable' | 'receivable';
  title: string;
  description?: string;
  url?: string;
  metadata: Record<string, any>;
  score: number;
  highlighted?: {
    field: string;
    fragments: string[];
  }[];
}

// Dashboard Financial Report models
export interface DashboardFinancialReport {
  totalReceivables: number;
  totalPayables: number;
  monthlyRevenue: number;
  availableBalance: number;
  overdueReceivables: number;
  overduePayablesCount: number;
  revenueGoal: number;
  projectedBalance7Days: number;
  cashFlowData: CashFlowItem[];
  expenseCategories: ExpenseCategory[];
  recentTransactions: Transaction[];
}

export interface SalesReport {
  totalSales: number;
  salesGrowth: number;
  averageTicket: number;
  conversionRate: number;
  topProducts: ProductSales[];
  salesByPeriod: SalesByPeriod[];
  salesByCategory: SalesByCategory[];
}

export interface CashFlowItem {
  month: string;
  revenue: number;
  expenses: number;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Transaction {
  id: number;
  date: Date;
  description: string;
  detail: string;
  category: string;
  categoryColor: string;
  amount: number;
  status: string;
  statusClass: string;
}

export interface ProductSales {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface SalesByPeriod {
  period: string;
  sales: number;
  orders: number;
}

export interface SalesByCategory {
  category: string;
  sales: number;
  percentage: number;
}

export interface SearchFilters {
  types?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  categories?: string[];
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'name' | 'amount';
  sortOrder?: 'asc' | 'desc';
}
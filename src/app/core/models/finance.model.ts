import { BaseEntity, PaymentStatus } from './core.model';

export interface Payable extends BaseEntity {
  id: number;
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  supplier: string;
  category: string;
  paymentMethod?: string;
  paymentDate?: Date;
  invoiceNumber?: string;
  notes?: string;
  attachmentUrl?: string;
  userId: number;
  installmentNumber?: number;
  totalInstallments?: number;
  parentPayableId?: number;
}

export interface Receivable extends BaseEntity {
  id: number;
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  client: string;
  clientId: number;
  category: string;
  paymentMethod?: string;
  paymentDate?: Date;
  invoiceNumber?: string;
  orderId?: number;
  notes?: string;
  attachmentUrl?: string;
  userId: number;
  installmentNumber?: number;
  totalInstallments?: number;
  parentReceivableId?: number;
}

export interface FinanceFilters {
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  category?: string;
  status?: string;
  type?: 'payable' | 'receivable' | 'all';
  paymentMethod?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface FinanceSummary {
  totalReceivables: number;
  totalPayables: number;
  balance: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  overdueReceivables: number;
  overduePayables: number;
  pendingReceivables: number;
  pendingPayables: number;
  projectedRevenue: number;
  projectedExpenses: number;
}

export interface PayableFormData {
  description: string;
  amount: number;
  dueDate: Date;
  supplier: string;
  category: string;
  paymentMethod?: string;
  invoiceNumber?: string;
  notes?: string;
  attachmentUrl?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface ReceivableFormData {
  description: string;
  amount: number;
  dueDate: Date;
  client: string;
  clientId: number;
  category: string;
  paymentMethod?: string;
  invoiceNumber?: string;
  orderId?: number;
  notes?: string;
  attachmentUrl?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface FinanceStats {
  totalPayables: number;
  totalReceivables: number;
  balance: number;
  overdueCount: number;
  overdueAmount: number;
  thisMonthPayables: number;
  thisMonthReceivables: number;
  nextMonthPayables: number;
  nextMonthReceivables: number;
  byCategory: Array<{
    category: string;
    payableAmount: number;
    receivableAmount: number;
    count: number;
  }>;
  byStatus: Array<{
    status: string;
    payableAmount: number;
    receivableAmount: number;
    count: number;
  }>;
  cashFlow: Array<{
    date: string;
    inflow: number;
    outflow: number;
    balance: number;
  }>;
}

export interface Payment {
  id: number;
  type: 'payable' | 'receivable';
  referenceId: number;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  status: PaymentStatus;
  transactionId?: string;
  notes?: string;
  userId: number;
}

export interface RecurringTransaction {
  id: number;
  description: string;
  amount: number;
  type: 'payable' | 'receivable';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  nextDate: Date;
  isActive: boolean;
  lastGeneratedId?: number;
  template: Omit<PayableFormData | ReceivableFormData, 'isRecurring' | 'recurringFrequency'>;
}

export interface FinancialReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: FinanceSummary;
  payables: Payable[];
  receivables: Receivable[];
  payments: Payment[];
  categories: Array<{
    name: string;
    payableAmount: number;
    receivableAmount: number;
    count: number;
  }>;
  trends: {
    revenue: Array<{ date: string; amount: number }>;
    expenses: Array<{ date: string; amount: number }>;
    balance: Array<{ date: string; amount: number }>;
  };
}
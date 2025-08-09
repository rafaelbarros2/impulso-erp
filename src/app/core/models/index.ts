// Centralized models export
export * from './core.model';
export * from './auth.model';
export * from './client.model';
export * from './product.model';
export * from './cart.model';
export * from './order.model';
export * from './finance.model';
export * from './ui.model';
export * from './app.model';
export * from './state.model';
export * from './store.model';

// Type aliases for convenience
export type ID = number | string;
export type Timestamp = Date | string;

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Common enum values
export const ORDER_STATUSES = [
  'pending',
  'confirmed', 
  'preparing',
  'ready',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
] as const;

export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'refunded',
  'failed'
] as const;

export const PAYMENT_METHODS = [
  'cash',
  'credit_card',
  'debit_card',
  'pix',
  'bank_transfer',
  'check'
] as const;

export const FINANCE_STATUSES = [
  'pending',
  'paid',
  'overdue',
  'cancelled'
] as const;

export const PRODUCT_CATEGORIES = [
  'Eletrônicos',
  'Acessórios',
  'Roupas',
  'Alimentos',
  'Bebidas',
  'Limpeza',
  'Papelaria',
  'Outros'
] as const;

export const UNIT_OF_MEASURES = [
  'UN',
  'KG',
  'L',
  'M',
  'M²',
  'M³',
  'CX',
  'PCT'
] as const;

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  cpfCnpj: /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/,
  cep: /^\d{5}-\d{3}$/,
  sku: /^[A-Z0-9-_]+$/i
} as const;

// Default values
export const DEFAULT_VALUES = {
  pagination: {
    page: 1,
    limit: 10,
    maxLimit: 100
  },
  dates: {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'DD/MM/YYYY HH:mm'
  },
  currency: {
    code: 'BRL',
    symbol: 'R$',
    decimalDigits: 2,
    decimalSeparator: ',',
    thousandsSeparator: '.'
  },
  ui: {
    toastDuration: 3000,
    loadingDelay: 200,
    animationDuration: 300
  }
} as const;
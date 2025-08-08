// Core base interfaces used across the application
export interface BaseEntity {
  id?: number | string;
  createdAt?: Date;
  updatedAt?: Date;
  active?: boolean;
}

export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> extends BaseResponse<T[]> {
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
}

export interface NotificationOptions {
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  data?: any;
}

export interface LoadingState {
  [key: string]: boolean;
}

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  errorCode?: string;
  fieldErrors?: Array<{
    field: string;
    rejectedValue: any;
    message: string;
  }>;
}

export interface ClientType {
  name: string;
  code: 'PF' | 'PJ';
}

// Common types
export type SortDirection = 'asc' | 'desc';
export type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type ThemeMode = 'light' | 'dark';
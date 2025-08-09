// Shared library models and types

export interface LoadingState {
  [key: string]: boolean;
}

export interface EmptyStateConfig {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly actionLabel?: string;
  readonly actionIcon?: string;
  readonly theme: 'default' | 'info' | 'warning' | 'error';
}

// Client type for CPF/CNPJ input
export enum ClientType {
  PF = 'PF',
  PJ = 'PJ'
}

// Empty states will be exported from the component to avoid conflicts
// This interface is for type safety only
export interface SharedEmptyStateConfig {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly actionLabel?: string;
  readonly actionIcon?: string;
  readonly theme: 'default' | 'info' | 'warning' | 'error';
}
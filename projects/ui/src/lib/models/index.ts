// Shared models for UI library

export enum ClientType {
  PF = 'individual',
  PJ = 'company'
}

export interface LoadingState {
  [key: string]: boolean | string | undefined;
}
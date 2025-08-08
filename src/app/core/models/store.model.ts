export interface Store {
  id: string;
  subdomain: string;
  name: string;
  createdAt: string;
  parentStore?: Store;
  subsidiaries?: Store[];
}

export interface StoreCreateRequest {
  subdomain: string;
  name: string;
}

export interface StoreUpdateRequest {
  name: string;
}

export interface StoreUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  isActive: boolean;
  createdAt: string;
  store: Store;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

export const USER_ROLES = [
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Gerente', value: 'MANAGER' },
  { label: 'Usuário', value: 'USER' }
] as const;
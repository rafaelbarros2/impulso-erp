import { BaseEntity } from './core.model';

export interface Client extends BaseEntity {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  category?: string;
  notes?: string;
  active: boolean;
  totalPurchases?: number;
  lastPurchaseDate?: Date;
}

export interface ClientFilters {
  search?: string;
  category?: string;
  status?: 'all' | 'active' | 'inactive' | '';
  city?: string;
  state?: string;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

export interface ClientFormData {
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  category?: string;
  notes?: string;
  active: boolean;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  topClientsByPurchases: Array<{
    client: Client;
    totalPurchases: number;
  }>;
  clientsByState: Array<{
    state: string;
    count: number;
  }>;
}

export interface ClientImportData {
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  category?: string;
}
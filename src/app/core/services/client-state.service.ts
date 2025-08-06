import { Injectable, signal, computed } from '@angular/core';
import { Client } from './client.service';

export interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  selectedClient: Client | null;
  totalClients: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientStateService {
  private state = signal<ClientState>({
    clients: [],
    loading: false,
    error: null,
    selectedClient: null,
    totalClients: 0
  });

  // Computed signals for reactive access
  readonly clients = computed(() => this.state().clients);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly selectedClient = computed(() => this.state().selectedClient);
  readonly totalClients = computed(() => this.state().totalClients);
  readonly hasClients = computed(() => this.state().clients.length > 0);
  readonly isEmpty = computed(() => this.state().clients.length === 0 && !this.state().loading);

  // Actions to update state
  setLoading(loading: boolean): void {
    this.state.update(state => ({ ...state, loading }));
  }

  setError(error: string | null): void {
    this.state.update(state => ({ ...state, error, loading: false }));
  }

  clearError(): void {
    this.state.update(state => ({ ...state, error: null }));
  }

  setClients(clients: Client[], totalCount?: number): void {
    this.state.update(state => ({
      ...state,
      clients,
      totalClients: totalCount ?? clients.length,
      loading: false,
      error: null
    }));
  }

  addClient(client: Client): void {
    this.state.update(state => ({
      ...state,
      clients: [...state.clients, client],
      totalClients: state.totalClients + 1
    }));
  }

  updateClient(updatedClient: Client): void {
    this.state.update(state => ({
      ...state,
      clients: state.clients.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      ),
      selectedClient: state.selectedClient?.id === updatedClient.id 
        ? updatedClient 
        : state.selectedClient
    }));
  }

  removeClient(clientId: number): void {
    this.state.update(state => ({
      ...state,
      clients: state.clients.filter(client => client.id !== clientId),
      totalClients: Math.max(0, state.totalClients - 1),
      selectedClient: state.selectedClient?.id === clientId 
        ? null 
        : state.selectedClient
    }));
  }

  selectClient(client: Client | null): void {
    this.state.update(state => ({ ...state, selectedClient: client }));
  }

  reset(): void {
    this.state.set({
      clients: [],
      loading: false,
      error: null,
      selectedClient: null,
      totalClients: 0
    });
  }

  // Filter clients by search term
  getFilteredClients(searchTerm: string = '') {
    return computed(() => {
      const clients = this.clients();
      if (!searchTerm.trim()) {
        return clients;
      }
      
      const term = searchTerm.toLowerCase();
      return clients.filter(client =>
        client.name.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.cpfCnpj?.includes(term)
      );
    });
  }

  // Get client by ID
  getClientById(id: number) {
    return computed(() => 
      this.clients().find(client => client.id === id) || null
    );
  }
}
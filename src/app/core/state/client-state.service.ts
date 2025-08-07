import { Injectable, computed, signal } from '@angular/core';
import { StateManagerService } from './state-manager.service';
import { BaseStateService } from './base-state.service';
import { 
  ClientState, 
  DEFAULT_CLIENT_STATE,
  Client, 
  ClientFilters 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClientStateService extends BaseStateService<ClientState> {
  protected state = signal<ClientState>({
    loading: false,
    error: null,
    lastUpdated: null,
    clients: [],
    selectedClient: null,
    totalClients: 0,
    filters: {
      search: '',
      category: '',
      status: 'all'
    }
  });

  constructor(private stateManager: StateManagerService) {
    super();
  }

  // Computed signals
  readonly clients = computed(() => this.state().clients);
  readonly selectedClient = computed(() => this.state().selectedClient);
  readonly totalClients = computed(() => this.state().totalClients);
  readonly filters = computed(() => this.state().filters);
  readonly hasClients = computed(() => this.state().clients.length > 0);
  readonly isEmpty = computed(() => this.state().clients.length === 0 && !this.state().loading);

  // Filtered clients
  readonly filteredClients = computed(() => {
    const clients = this.clients();
    const filters = this.filters();
    
    return clients.filter(client => {
      const matchesSearch = !filters.search || 
        client.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        client.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        client.cpfCnpj?.includes(filters.search);
      
      const matchesCategory = !filters.category || 
        client.category === filters.category;
      
      const matchesStatus = !filters.status || 
        (filters.status === 'active' && client.active) ||
        (filters.status === 'inactive' && !client.active);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  });

  // Actions
  async loadClients(): Promise<void> {
    this.setLoading(true);
    
    try {
      // Simulate API call - replace with actual service call
      // const clients = await this.clientService.getClients();
      
      // For demo purposes, using mock data
      setTimeout(() => {
        const mockClients: Client[] = [
          {
            id: 1,
            name: 'João Silva',
            email: 'joao@example.com',
            phone: '(11) 99999-9999',
            cpfCnpj: '123.456.789-00',
            active: true
          },
          {
            id: 2,
            name: 'Maria Santos',
            email: 'maria@example.com',
            phone: '(11) 88888-8888',
            cpfCnpj: '987.654.321-00',
            active: true
          }
        ];

        this.setClients(mockClients);
      }, 500);
    } catch (error) {
      this.setError('Erro ao carregar clientes');
    } finally {
      this.setLoading(false);
    }
  }

  setClients(clients: Client[]): void {
    this.state.update(state => ({
      ...state,
      clients,
      totalClients: clients.length,
      loading: false,
      error: null,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setClients(clients);
  }

  addClient(client: Client): void {
    this.state.update(state => ({
      ...state,
      clients: [...state.clients, { ...client, id: Date.now() }],
      totalClients: state.totalClients + 1,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setClients(this.state().clients);
  }

  updateClient(updatedClient: Client): void {
    this.state.update(state => ({
      ...state,
      clients: state.clients.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      ),
      selectedClient: state.selectedClient?.id === updatedClient.id 
        ? updatedClient 
        : state.selectedClient,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setClients(this.state().clients);
  }

  removeClient(clientId: number): void {
    this.state.update(state => ({
      ...state,
      clients: state.clients.filter(client => client.id !== clientId),
      totalClients: Math.max(0, state.totalClients - 1),
      selectedClient: state.selectedClient?.id === clientId 
        ? null 
        : state.selectedClient,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setClients(this.state().clients);
  }

  selectClient(client: Client | null): void {
    this.state.update(state => ({
      ...state,
      selectedClient: client,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setSelectedClient(client);
  }

  setFilters(filters: Partial<ClientFilters>): void {
    this.state.update(state => ({
      ...state,
      filters: { ...state.filters, ...filters },
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setClientFilters(filters);
  }

  getClientById(id: number): Client | null {
    return this.clients().find(client => client.id === id) || null;
  }

  searchClients(term: string): void {
    this.setFilters({ search: term });
  }

  reset(): void {
    this.state.set({
      loading: false,
      error: null,
      lastUpdated: null,
      clients: [],
      selectedClient: null,
      totalClients: 0,
      filters: {
        search: '',
        category: '',
        status: 'all'
      }
    });
  }

  getStateSnapshot(): ClientState {
    return this.state();
  }
}
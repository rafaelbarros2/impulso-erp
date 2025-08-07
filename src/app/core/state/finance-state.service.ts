import { Injectable, computed, signal } from '@angular/core';
import { StateManagerService } from './state-manager.service';
import { BaseStateService } from './base-state.service';
import { 
  FinanceState, 
  FinanceFilters, 
  FinanceSummary,
  DEFAULT_FINANCE_STATE,
  Payable,
  Receivable,
  FinancialReport
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class FinanceStateService extends BaseStateService<FinanceState> {
  protected state = signal<FinanceState>({
    loading: false,
    error: null,
    lastUpdated: null,
    payables: [],
    receivables: [],
    summary: {
      totalReceivables: 0,
      totalPayables: 0,
      balance: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      overdueReceivables: 0,
      overduePayables: 0
    },
    reports: {},
    filters: {
      dateRange: {
        start: null,
        end: null
      },
      category: '',
      status: ''
    }
  });

  constructor(private stateManager: StateManagerService) {
    super();
  }

  // Computed signals
  readonly payables = computed(() => this.state().payables);
  readonly receivables = computed(() => this.state().receivables);
  readonly summary = computed(() => this.state().summary);
  readonly reports = computed(() => this.state().reports);
  readonly filters = computed(() => this.state().filters);

  // Filtered data
  readonly filteredPayables = computed(() => {
    const payables = this.payables();
    const filters = this.filters();
    
    return payables.filter(payable => {
      const matchesCategory = !filters.category || payable.category === filters.category;
      const matchesStatus = !filters.status || payable.status === filters.status;
      const matchesDateRange = (!filters.dateRange.start || payable.dueDate >= filters.dateRange.start) &&
        (!filters.dateRange.end || payable.dueDate <= filters.dateRange.end);
      
      return matchesCategory && matchesStatus && matchesDateRange;
    });
  });

  readonly filteredReceivables = computed(() => {
    const receivables = this.receivables();
    const filters = this.filters();
    
    return receivables.filter(receivable => {
      const matchesCategory = !filters.category || receivable.category === receivable.category;
      const matchesStatus = !filters.status || receivable.status === receivable.status;
      const matchesDateRange = (!filters.dateRange.start || receivable.dueDate >= filters.dateRange.start) &&
        (!filters.dateRange.end || receivable.dueDate <= filters.dateRange.end);
      
      return matchesCategory && matchesStatus && matchesDateRange;
    });
  });

  // Statistics
  readonly overduePayables = computed(() => 
    this.payables().filter(payable => payable.status === 'overdue')
  );

  readonly overdueReceivables = computed(() => 
    this.receivables().filter(receivable => receivable.status === 'overdue')
  );

  readonly pendingPayables = computed(() => 
    this.payables().filter(payable => payable.status === 'pending')
  );

  readonly pendingReceivables = computed(() => 
    this.receivables().filter(receivable => receivable.status === 'pending')
  );

  readonly categories = computed(() => {
    const payableCategories = new Set(this.payables().map(p => p.category));
    const receivableCategories = new Set(this.receivables().map(r => r.category));
    return Array.from(new Set([...payableCategories, ...receivableCategories]));
  });

  // Actions
  async loadFinanceData(): Promise<void> {
    this.setLoading(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        const mockPayables: Payable[] = [
          {
            id: 1,
            description: 'Fornecedor A',
            amount: 1000,
            dueDate: new Date('2024-02-01'),
            status: 'pending',
            supplier: 'Fornecedor A',
            category: 'Material',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          {
            id: 2,
            description: 'Aluguel',
            amount: 2000,
            dueDate: new Date('2024-02-05'),
            status: 'pending',
            supplier: 'Imobiliária',
            category: 'Aluguel',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          }
        ];

        const mockReceivables: Receivable[] = [
          {
            id: 1,
            description: 'Cliente João',
            amount: 1500,
            dueDate: new Date('2024-02-10'),
            status: 'pending',
            client: 'João Silva',
            category: 'Venda',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
          },
          {
            id: 2,
            description: 'Cliente Maria',
            amount: 800,
            dueDate: new Date('2024-02-15'),
            status: 'pending',
            client: 'Maria Santos',
            category: 'Venda',
            createdAt: new Date('2024-01-16'),
            updatedAt: new Date('2024-01-16')
          }
        ];

        this.setPayables(mockPayables);
        this.setReceivables(mockReceivables);
        this.updateSummary();
      }, 500);
    } catch (error) {
      this.setError('Erro ao carregar dados financeiros');
    } finally {
      this.setLoading(false);
    }
  }

  setPayables(payables: Payable[]): void {
    this.state.update(state => ({
      ...state,
      payables,
      lastUpdated: new Date()
    }));
    this.updateSummary();
  }

  setReceivables(receivables: Receivable[]): void {
    this.state.update(state => ({
      ...state,
      receivables,
      lastUpdated: new Date()
    }));
    this.updateSummary();
  }

  addPayable(payable: Payable): void {
    this.state.update(state => ({
      ...state,
      payables: [...state.payables, { ...payable, id: Date.now() }],
      lastUpdated: new Date()
    }));
    this.updateSummary();
  }

  addReceivable(receivable: Receivable): void {
    this.state.update(state => ({
      ...state,
      receivables: [...state.receivables, { ...receivable, id: Date.now() }],
      lastUpdated: new Date()
    }));
    this.updateSummary();
  }

  updatePayable(updatedPayable: Payable): void {
    this.state.update(state => ({
      ...state,
      payables: state.payables.map(payable => 
        payable.id === updatedPayable.id ? { ...updatedPayable, updatedAt: new Date() } : payable
      ),
      lastUpdated: new Date()
    }));
    this.updateSummary();
  }

  updateReceivable(updatedReceivable: Receivable): void {
    this.state.update(state => ({
      ...state,
      receivables: state.receivables.map(receivable => 
        receivable.id === updatedReceivable.id ? { ...updatedReceivable, updatedAt: new Date() } : receivable
      ),
      lastUpdated: new Date()
    }));
    this.updateSummary();
  }

  removePayable(payableId: number): void {
    this.state.update(state => ({
      ...state,
      payables: state.payables.filter(payable => payable.id !== payableId),
      lastUpdated: new Date()
    }));
    this.updateSummary();
  }

  removeReceivable(receivableId: number): void {
    this.state.update(state => ({
      ...state,
      receivables: state.receivables.filter(receivable => receivable.id !== receivableId),
      lastUpdated: new Date()
    }));
    this.updateSummary();
  }

  updatePayableStatus(payableId: number, status: Payable['status']): void {
    this.state.update(state => ({
      ...state,
      payables: state.payables.map(payable =>
        payable.id === payableId ? { ...payable, status, updatedAt: new Date() } : payable
      ),
      lastUpdated: new Date()
    }));
    this.updateSummary();
  }

  updateReceivableStatus(receivableId: number, status: Receivable['status']): void {
    this.state.update(state => ({
      ...state,
      receivables: state.receivables.map(receivable =>
        receivable.id === receivableId ? { ...receivable, status, updatedAt: new Date() } : receivable
      ),
      lastUpdated: new Date()
    }));
    this.updateSummary();
  }

  setFilters(filters: Partial<FinanceFilters>): void {
    this.state.update(state => ({
      ...state,
      filters: { ...state.filters, ...filters },
      lastUpdated: new Date()
    }));
  }

  private updateSummary(): void {
    const payables = this.payables();
    const receivables = this.receivables();
    
    const totalPayables = payables.reduce((sum, payable) => sum + payable.amount, 0);
    const totalReceivables = receivables.reduce((sum, receivable) => sum + receivable.amount, 0);
    
    const overduePayables = payables
      .filter(payable => payable.status === 'overdue')
      .reduce((sum, payable) => sum + payable.amount, 0);
    
    const overdueReceivables = receivables
      .filter(receivable => receivable.status === 'overdue')
      .reduce((sum, receivable) => sum + receivable.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = receivables
      .filter(receivable => {
        const receivableDate = new Date(receivable.createdAt);
        return receivableDate.getMonth() === currentMonth && 
               receivableDate.getFullYear() === currentYear;
      })
      .reduce((sum, receivable) => sum + receivable.amount, 0);
    
    const monthlyExpenses = payables
      .filter(payable => {
        const payableDate = new Date(payable.createdAt);
        return payableDate.getMonth() === currentMonth && 
               payableDate.getFullYear() === currentYear;
      })
      .reduce((sum, payable) => sum + payable.amount, 0);
    
    const summary: FinanceSummary = {
      totalReceivables,
      totalPayables,
      balance: totalReceivables - totalPayables,
      monthlyRevenue,
      monthlyExpenses,
      overdueReceivables,
      overduePayables
    };
    
    this.state.update(state => ({
      ...state,
      summary,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setFinance({ summary });
  }

  getPayableById(id: number): Payable | null {
    return this.payables().find(payable => payable.id === id) || null;
  }

  getReceivableById(id: number): Receivable | null {
    return this.receivables().find(receivable => receivable.id === id) || null;
  }

  getPayablesByCategory(category: string): Payable[] {
    return this.payables().filter(payable => payable.category === category);
  }

  getReceivablesByCategory(category: string): Receivable[] {
    return this.receivables().filter(receivable => receivable.category === category);
  }

  reset(): void {
    this.state.set({
      loading: false,
      error: null,
      lastUpdated: null,
      payables: [],
      receivables: [],
      summary: {
        totalReceivables: 0,
        totalPayables: 0,
        balance: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        overdueReceivables: 0,
        overduePayables: 0
      },
      reports: {},
      filters: {
        dateRange: {
          start: null,
          end: null
        },
        category: '',
        status: ''
      }
    });
  }

  getStateSnapshot(): FinanceState {
    return this.state();
  }
}